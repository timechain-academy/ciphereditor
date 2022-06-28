
import './input-text.scss'
import React, { useRef, useCallback, useLayoutEffect, ChangeEvent, FocusEventHandler } from 'react'
import useShortcutHandler from '../../hooks/useShortcutHandler'
import useWindowResizeListener from '../../hooks/useWindowResizeListener'
import { renderClassName, ViewModifiers } from '../../utils/dom'

/**
 * List of shortcuts that should not further propagate from the text input
 * (i.e. triggering for both the text input and the application)
 */
const stopPropagationForShortcuts = [
  'backspace',
  'control+shift+z',
  'control+z',
  'delete',
  'meta+z',
  'shift+meta+z'
]

/**
 * Component for single and multiline text.
 */
export default function InputTextView (props: {
  id?: string
  value?: string
  disabled?: boolean
  readOnly?: boolean
  modifiers?: ViewModifiers
  onChange?: (value: string, event: ChangeEvent) => void
  onFocus?: FocusEventHandler
  onBlur?: FocusEventHandler
}): JSX.Element {
  const { onChange, modifiers, ...textareaProps } = props
  const textareaRef = useRef<HTMLTextAreaElement|null>(null)

  // Auto resize textarea
  const resizeTextarea = useCallback(() => {
    if (textareaRef.current !== null) {
      // Autoresize textarea
      const $textarea = textareaRef.current
      $textarea.style.height = ''
      $textarea.style.height = `${$textarea.scrollHeight}px`
    }
  }, [textareaRef])

  // Shortcuts
  useShortcutHandler(textareaRef.current, (shortcut, event) => {
    if (stopPropagationForShortcuts.includes(shortcut)) {
      event.stopPropagation()
    }
  })

  // Handle changes
  const onInternalChange = (event: React.ChangeEvent<HTMLTextAreaElement>): void => {
    if (event.currentTarget.value !== undefined) {
      resizeTextarea()
    }
    if (onChange !== undefined) {
      onChange(event.currentTarget.value, event)
    }
  }

  // Resize textarea on window resize and synchronously after all DOM mutations
  useLayoutEffect(resizeTextarea)
  useWindowResizeListener(resizeTextarea)

  return (
    <div className={renderClassName('input-text', modifiers)}>
      <textarea
        className='input-text__textarea'
        ref={textareaRef}
        tabIndex={0}
        onChange={onInternalChange}
        spellCheck={false}
        autoComplete='off'
        autoCorrect='off'
        rows={1}
        {...textareaProps}
      />
    </div>
  )
}