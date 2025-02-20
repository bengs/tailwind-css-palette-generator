import React, {useState, useEffect, useMemo} from 'react'
import {Transition} from '@headlessui/react'

import Header from './Header'
import type {PaletteConfig} from '~/types/palette'
import Demo from '~/components/Demo'
import Palette from '~/components/Palette'
import Graphs from '~/components/Graphs'
import Output from '~/components/Output'
import {arrayObjectDiff, createRandomPalette} from '~/lib/helpers'
import {convertParamsToPath, removeSearchParamByKey} from '~/lib/history'
import {Block, PortableText} from '~/components/PortableText'
import {handleMeta} from '~/lib/meta'
import {usePrevious} from '~/lib/hooks'

export default function Generator({palettes, about}: {palettes: PaletteConfig[]; about: Block[]}) {
  const [palettesState, setPalettesState] = useState(palettes)
  const [showDemo, setShowDemo] = useState(false)
  const previousPalettes: undefined | PaletteConfig[] = usePrevious(palettesState)

  // Maybe update document meta on each state change
  // Initially it seemed like a good idea to handle this globally as a side-effect
  // ...but now I'm less sure
  useEffect(() => {
    // Only update meta if the `name` or `value` changed between renders
    // Or if it's the first render

    // TODO: Don't update title if pathname was `/` and palette is random
    const keysChanged = previousPalettes ? arrayObjectDiff(previousPalettes, palettesState) : []

    if (!previousPalettes || keysChanged.includes(`value`) || keysChanged.includes(`name`)) {
      // Only update history if the `value` changed
      handleMeta(palettesState, keysChanged.includes(`value`))
    }
  }, [palettesState])

  const handleNew = () => {
    const currentValues = palettesState.map((p) => p.value)
    const randomPalette = createRandomPalette(currentValues)
    const newPalettes = [...palettesState, randomPalette]
    setPalettesState(newPalettes)

    // Scroll new ID into view
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        const newElement = document.getElementById(`s-${randomPalette.value.toUpperCase()}`)

        if (newElement) {
          newElement.scrollIntoView({behavior: 'smooth'})
        }
      }, 50)
    }
  }

  const handleDemo = () => setShowDemo(!showDemo)

  const handleUpdate = (palette: PaletteConfig, index: number) => {
    const currentPalettes = [...palettesState]
    currentPalettes[index] = palette

    setPalettesState(currentPalettes)
  }

  const handleDelete = (deleteId: string, deleteName: string) => {
    if (palettesState.length === 1) {
      return
    }

    const updatedPalettes = palettesState.filter((p) => p.id !== deleteId)

    if (updatedPalettes.length === 1) {
      // Switch from query params to path
      convertParamsToPath(updatedPalettes)
    } else {
      // Update query params
      removeSearchParamByKey(deleteName)
    }

    setPalettesState(updatedPalettes)
  }

  const styleString = useMemo(
    () =>
      [
        `:root {`,
        ...palettesState[0].swatches.map((swatch) => `--first-${swatch.stop}: ${swatch.hex};`),
        `}`,
      ].join(`\n`),
    [palettesState]
  )

  return (
    <main className="pb-32 pt-header">
      <style>{styleString}</style>

      <Header handleNew={handleNew} handleDemo={handleDemo} />

      {showDemo ? <Demo palettes={palettesState} close={handleDemo} /> : null}

      <section className="grid grid-cols-1 p-4 gap-y-12 container mx-auto">
        {palettesState.map((palette: PaletteConfig, index: number) => (
          <React.Fragment key={palette.id}>
            <Transition
              appear
              show
              enter="transition-opacity duration-1000"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity duration-1000"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Palette
                palette={palette}
                updateGlobal={(updatedPalette: PaletteConfig) =>
                  handleUpdate(updatedPalette, index)
                }
                deleteGlobal={
                  palettesState.length <= 1
                    ? undefined
                    : () => handleDelete(palette.id, palette.name)
                }
              />
            </Transition>
            <div className="border-t border-gray-200" />
          </React.Fragment>
        ))}

        <Graphs palettes={palettesState} />

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="row-start-2 md:row-start-1 md:col-span-3">
            {about.length ? <PortableText blocks={about} /> : null}
          </div>
          <div className="row-start-1 md:col-span-2 flex flex-col gap-4">
            <div className="prose text-center">
              <p>
                Paste this into your <code>tailwind.config.js</code>
              </p>
            </div>
            <Output palettes={palettesState} />
          </div>
        </div>
      </section>
    </main>
  )
}
