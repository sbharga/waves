import { useEffect, useMemo, useState } from 'react'
import { AmbientBackdrop } from './components/AmbientBackdrop'
import { ControlDock, type DrawerId } from './components/ControlDock'
import { CoolorsModal } from './components/CoolorsModal'
import { Notice, type NoticeState } from './components/Notice'
import { TopBar } from './components/TopBar'
import { WallpaperPreview } from './components/WallpaperPreview'
import { DEVICE_PRESETS, MAX_PALETTE_COLORS, PALETTES } from './constants'
import { exportPng } from './exporters'
import { nextPaletteColor, parseCoolorsUrl } from './palette'
import { initialState, normalizeState, reorderPalette, serializeState } from './state'
import type { WallpaperState } from './types'

function App() {
  const [state, setState] = useState<WallpaperState>(initialState)
  const [notice, setNotice] = useState<NoticeState>(null)
  const [exporting, setExporting] = useState(false)
  const [coolorsUrl, setCoolorsUrl] = useState('')
  const [showCoolorsImport, setShowCoolorsImport] = useState(false)
  const [activeDrawer, setActiveDrawer] = useState<DrawerId>(null)
  const [dockHidden, setDockHidden] = useState(false)

  const selectedPreset = DEVICE_PRESETS.find((preset) => preset.id === state.presetId)
  const portrait = state.height > state.width
  const paletteName = useMemo(
    () => Object.entries(PALETTES).find(([, colors]) => colors.length === state.palette.length
      && colors.every((color, index) => color === state.palette[index]))?.[0],
    [state.palette],
  )

  const update = (patch: Partial<WallpaperState>) => {
    setState((current) => normalizeState({ ...current, ...patch }))
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const url = new URL(window.location.href)
      url.searchParams.delete('design')
      url.hash = serializeState(state)
      window.history.replaceState(null, '', url)
    }, 250)
    return () => window.clearTimeout(timer)
  }, [state])

  useEffect(() => {
    if (!notice) return
    const timer = window.setTimeout(() => setNotice(null), 3600)
    return () => window.clearTimeout(timer)
  }, [notice])

  const chooseDevice = (id: string) => {
    if (id === 'custom') {
      update({ presetId: 'custom' })
      return
    }
    const preset = DEVICE_PRESETS.find((item) => item.id === id)
    if (!preset) return
    update({
      presetId: preset.id,
      width: portrait ? preset.height : preset.width,
      height: portrait ? preset.width : preset.height,
    })
  }

  const rotate = () => update({ width: state.height, height: state.width })

  const updateColor = (index: number, color: string) => {
    const palette = [...state.palette]
    palette[index] = color
    update({ palette })
  }

  const moveColor = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return
    update({ palette: reorderPalette(state.palette, fromIndex, toIndex) })
  }

  const removeColor = (index: number) => {
    if (state.palette.length === 1) {
      setNotice({ tone: 'error', message: 'A palette needs at least one color.' })
      return
    }
    update({ palette: state.palette.filter((_, colorIndex) => colorIndex !== index) })
    setNotice({ tone: 'success', message: 'Color removed' })
  }

  const addColor = () => {
    if (state.palette.length >= MAX_PALETTE_COLORS) return
    update({ palette: [...state.palette, nextPaletteColor(state.palette)] })
    setNotice({ tone: 'success', message: 'Color added' })
  }

  const selectPalette = (colors: string[]) => update({ palette: colors })

  const importCoolors = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const palette = parseCoolorsUrl(coolorsUrl)
    if (!palette) {
      setNotice({ tone: 'error', message: 'Enter a Coolors link containing one or more hex colors.' })
      return
    }
    if (palette.length > MAX_PALETTE_COLORS) {
      setNotice({ tone: 'error', message: `A palette can hold up to ${MAX_PALETTE_COLORS} colors.` })
      return
    }
    update({ palette })
    setCoolorsUrl('')
    setShowCoolorsImport(false)
    setNotice({ tone: 'success', message: 'Coolors palette imported' })
  }

  const copyLink = async () => {
    const url = new URL(window.location.href)
    url.searchParams.delete('design')
    url.hash = serializeState(state)
    try {
      await navigator.clipboard.writeText(url.toString())
      setNotice({ tone: 'success', message: 'Design link copied' })
    } catch {
      window.prompt('Copy this design link:', url.toString())
    }
  }

  const download = async () => {
    if (exporting) return
    setExporting(true)
    try {
      await exportPng(state)
      setNotice({ tone: 'success', message: 'PNG downloaded' })
    } catch (error) {
      setNotice({ tone: 'error', message: error instanceof Error ? error.message : 'Export failed.' })
    } finally {
      setExporting(false)
    }
  }

  const toggleDrawer = (id: Exclude<DrawerId, null>) => {
    setActiveDrawer((current) => (current === id ? null : id))
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showCoolorsImport) {
          setShowCoolorsImport(false)
        } else if (activeDrawer) {
          setActiveDrawer(null)
        }
        return
      }

      const target = event.target as HTMLElement | null
      const isTyping = !!target && (
        target.tagName === 'INPUT'
        || target.tagName === 'TEXTAREA'
        || target.tagName === 'SELECT'
        || target.isContentEditable
      )
      if (isTyping || event.metaKey || event.ctrlKey || event.altKey) return

      switch (event.key.toLowerCase()) {
        case 'n':
          event.preventDefault()
          update({ seed: Math.floor(Math.random() * 2_147_483_646) + 1 })
          break
        case 'd':
          event.preventDefault()
          download()
          break
        case 'l':
          event.preventDefault()
          copyLink()
          break
        case 'h':
          event.preventDefault()
          setDockHidden((current) => !current)
          break
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [showCoolorsImport, activeDrawer, state, exporting])

  return (
    <main className="app-shell">
      <AmbientBackdrop state={state} />

      <TopBar
        formatLabel={selectedPreset?.label ?? 'Custom'}
        width={state.width}
        height={state.height}
        exporting={exporting}
        onCopyLink={copyLink}
        onDownload={download}
      />

      <div className="stage" role="region" aria-label="Wallpaper preview">
        <WallpaperPreview state={state} />
      </div>

      <ControlDock
        state={state}
        paletteName={paletteName}
        portrait={portrait}
        activeDrawer={activeDrawer}
        hidden={dockHidden}
        onToggleDrawer={toggleDrawer}
        onToggleHidden={() => setDockHidden((current) => !current)}
        onUpdateColor={updateColor}
        onMoveColor={moveColor}
        onRemoveColor={removeColor}
        onAddColor={addColor}
        onSelectPalette={selectPalette}
        onOpenCoolorsImport={() => setShowCoolorsImport(true)}
        onDepthChange={(depth) => update({ depth })}
        onShuffle={() => update({ seed: Math.floor(Math.random() * 2_147_483_646) + 1 })}
        onChooseDevice={chooseDevice}
        onWidthChange={(width) => update({ presetId: 'custom', width })}
        onHeightChange={(height) => update({ presetId: 'custom', height })}
        onRotate={rotate}
      />

      <Notice notice={notice} elevated={!dockHidden} />

      {showCoolorsImport && (
        <CoolorsModal
          url={coolorsUrl}
          onUrlChange={setCoolorsUrl}
          onSubmit={importCoolors}
          onClose={() => setShowCoolorsImport(false)}
        />
      )}
    </main>
  )
}

export default App
