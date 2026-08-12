import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { exportPng } from './exporters'

vi.mock('./components/WallpaperPreview', () => ({
  WallpaperPreview: () => <div data-testid="wallpaper-preview" />,
}))

vi.mock('./components/AmbientBackdrop', () => ({
  AmbientBackdrop: () => <div data-testid="ambient-backdrop" />,
}))

vi.mock('./exporters', () => ({
  exportPng: vi.fn().mockResolvedValue(undefined),
}))

afterEach(cleanup)

describe('top bar and control dock', () => {
  it('presents the drawer tabs and download action', () => {
    render(<App />)

    expect(screen.getByRole('button', { name: 'Canvas' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Presets' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Download PNG' })).toBeInTheDocument()
  })

  it('updates canvas dimensions and rotates the orientation via the Canvas drawer', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: 'Canvas' }))
    fireEvent.click(screen.getByRole('button', { name: /^Format/ }))
    fireEvent.click(screen.getByRole('option', { name: /Phone/ }))
    expect(screen.getByText('Phone · 1179 × 2556')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Rotate orientation' }))
    expect(screen.getByText('Phone · 2556 × 1179')).toBeInTheDocument()
  })

  it('allows a canvas dimension to be cleared and replaced before committing it', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: 'Canvas' }))
    const width = screen.getByRole('spinbutton', { name: 'Width in pixels' }) as HTMLInputElement
    fireEvent.change(width, { target: { value: '' } })
    expect(width.value).toBe('')

    fireEvent.change(width, { target: { value: '1440' } })
    fireEvent.blur(width)
    expect(screen.getByText(/1440 × 1080/)).toBeInTheDocument()
  })

  it('selects a palette preset and opens the Coolors importer from the Presets drawer', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: 'Presets' }))
    fireEvent.click(screen.getByRole('button', { name: /Ocean/ }))
    expect(screen.getByRole('button', { name: /Ocean/ })).toHaveAttribute('aria-pressed', 'true')

    fireEvent.click(screen.getByRole('button', { name: 'Import from Coolors' }))
    expect(screen.getByRole('dialog', { name: 'Import a palette' })).toBeInTheDocument()
  })

  it('imports protocol-less Coolors links and enforces the palette limit', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: 'Presets' }))
    fireEvent.click(screen.getByRole('button', { name: 'Import from Coolors' }))
    const input = screen.getByRole('textbox', { name: 'Coolors palette URL' })

    fireEvent.change(input, { target: { value: 'coolors.co/111111-222222-333333' } })
    fireEvent.submit(input.closest('form')!)
    expect(screen.queryByRole('dialog', { name: 'Import a palette' })).not.toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(3)

    fireEvent.click(screen.getByRole('button', { name: 'Import from Coolors' }))
    const reopenedInput = screen.getByRole('textbox', { name: 'Coolors palette URL' })
    fireEvent.change(reopenedInput, {
      target: { value: 'coolors.co/111111-222222-333333-444444-555555-666666-777777-888888-999999' },
    })
    fireEvent.submit(reopenedInput.closest('form')!)
    expect(screen.getByRole('status')).toHaveTextContent('A palette can hold up to 8 colors.')
    expect(screen.getByRole('dialog', { name: 'Import a palette' })).toBeInTheDocument()
  })
})

describe('palette bar', () => {
  it('adds a color to the palette', () => {
    render(<App />)

    const before = screen.getAllByRole('listitem').length
    fireEvent.click(screen.getByRole('button', { name: 'Add a color' }))
    expect(screen.getAllByRole('listitem')).toHaveLength(before + 1)
  })

  it('commits a valid hex value typed into the selected color popover', () => {
    render(<App />)

    fireEvent.click(screen.getAllByRole('listitem')[0])
    const hexInput = screen.getByLabelText('Hex color value')
    fireEvent.change(hexInput, { target: { value: '#123456' } })
    fireEvent.blur(hexInput)

    expect(screen.getAllByRole('listitem')[0]).toHaveStyle({ backgroundColor: 'rgb(18, 52, 86)' })
  })

  it('rejects a malformed hex value and reverts the field', () => {
    render(<App />)

    fireEvent.click(screen.getAllByRole('listitem')[0])
    const hexInput = screen.getByLabelText('Hex color value') as HTMLInputElement
    const original = hexInput.value

    fireEvent.change(hexInput, { target: { value: 'not-a-color' } })
    fireEvent.blur(hexInput)

    expect(hexInput.value).toBe(original)
  })

  it('closes the color popover when its selected swatch is clicked again', () => {
    render(<App />)

    const swatch = screen.getAllByRole('listitem')[0]
    fireEvent.click(swatch)
    expect(screen.getByRole('dialog', { name: 'Edit color 1' })).toBeInTheDocument()

    fireEvent.mouseDown(swatch)
    fireEvent.click(swatch)
    expect(screen.queryByRole('dialog', { name: 'Edit color 1' })).not.toBeInTheDocument()
  })

  it('keeps editing the same color after moving it', () => {
    render(<App />)

    fireEvent.click(screen.getAllByRole('listitem')[0])
    fireEvent.click(screen.getByRole('button', { name: 'Move color right' }))

    expect(screen.getByRole('dialog', { name: 'Edit color 2' })).toBeInTheDocument()
    expect(screen.getByLabelText('Hex color value')).toHaveValue('#9490c1')
  })
})

describe('keyboard shortcuts', () => {
  it('downloads on D, but ignores the shortcut while typing in a field', async () => {
    render(<App />)

    fireEvent.keyDown(window, { key: 'd' })
    await waitFor(() => expect(exportPng).toHaveBeenCalledTimes(1))

    fireEvent.click(screen.getAllByRole('listitem')[0])
    const hexInput = screen.getByLabelText('Hex color value')
    fireEvent.keyDown(hexInput, { key: 'd' })
    expect(exportPng).toHaveBeenCalledTimes(1)
  })
})
