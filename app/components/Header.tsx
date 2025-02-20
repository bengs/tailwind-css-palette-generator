import React from 'react'
import {Link} from 'remix'
import {CodeIcon, LinkIcon, PlusIcon, SparklesIcon} from '@heroicons/react/solid'
import {useCopyToClipboard} from 'usehooks-ts'

import GitHub from './GitHub'
import Twitter from './Twitter'
import Button from './Button'
import ButtonIcon from '~/components/ButtonIcon'

export default function Header({
  handleNew,
  handleDemo,
}: {
  handleNew: Function
  handleDemo: Function
}) {
  const [, copy] = useCopyToClipboard()

  const handleCopyURL = () => {
    if (typeof window !== undefined) {
      copy(window.location.href)
    }
  }

  const handleOpenAPI = () => {
    if (typeof window !== undefined) {
      const currentUrl = new URL(window.location.href)
      currentUrl.pathname = `api`
      window.open(currentUrl.toString(), '_blank')
    }
  }

  return (
    <header className="fixed z-40 inset-0 bottom-auto bg-white/90 backdrop-blur-lg border-b border-first-100">
      <div className="container mx-auto px-4 flex items-center justify-between h-header">
        <Link to="/" className="flex items-center gap-2">
          <>
            <span className="font-bold text-first-600 text-xs md:text-lg">Palette Generator</span>
            <span className="font-medium text-first-300 hidden md:block">
              + API for Tailwind CSS
            </span>
          </>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          <ButtonIcon
            title="Open Project on GitHub"
            icon={GitHub}
            href="https://github.com/SimeonGriggs/tailwind-css-palette-generator"
          />
          <ButtonIcon
            title="Say hello on Twitter"
            icon={Twitter}
            href="https://twitter.com/simeonGriggs"
          />
          <ButtonIcon title="Copy URL" icon={LinkIcon} onClick={handleCopyURL} />
          <ButtonIcon title="Open API Link" icon={CodeIcon} onClick={handleOpenAPI} />
          <Button id="demo-button" onClick={handleDemo}>
            <SparklesIcon className="w-4 h-auto" />
            <span className="sr-only md:not-sr-only">Demo</span>
          </Button>
          <Button id="add-button" onClick={handleNew}>
            <PlusIcon className="w-4 h-auto" />
            <span className="sr-only md:not-sr-only">Add</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
