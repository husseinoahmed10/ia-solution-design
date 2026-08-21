"use client";

import { useEffect, useRef } from "react";

/**
 * The canvas actions a keyboard shortcut can reach.
 *
 * They are **passed in rather than looked up here**, which keeps this hook free of
 * both React Flow and Liveblocks: the zoom actions are the viewport calls the
 * control bar's buttons make and the history actions are Liveblocks' own `undo` and
 * `redo`, so a key and the button beside it run the same thing and cannot drift
 * apart. There is no second history stack and no second definition of a zoom step.
 *
 * Fitting the view is deliberately absent. It is a button on the control bar and
 * has no shortcut, so binding one would be behaviour the specification does not ask
 * for.
 */
export interface CanvasKeyboardShortcutActions {
  /** Zoom the viewport in one step. */
  onZoomIn: () => void;
  /** Zoom the viewport out one step. */
  onZoomOut: () => void;
  /** Undo the last collaborative change this client made. */
  onUndo: () => void;
  /** Redo the change this client last undid. */
  onRedo: () => void;
}

/**
 * The canvas keyboard shortcuts.
 *
 * | Keys | Action |
 * | --- | --- |
 * | `+` or `=` | zoom in |
 * | `-` | zoom out |
 * | `Cmd/Ctrl + Z` | undo |
 * | `Cmd/Ctrl + Shift + Z` | redo |
 * | `Cmd/Ctrl + Y` | redo |
 *
 * The listener is on `window` rather than on the canvas element, because a shortcut
 * has to work without the canvas having been clicked first: React Flow's viewport is
 * not a focusable element, so requiring focus would mean the keys did nothing on a
 * freshly opened workspace.
 *
 * That reach is exactly why **an event from a text field is left alone**. The one
 * listener would otherwise see every keystroke on the page, so typing `-` into a
 * node label or a connection label would zoom the canvas out, and `Cmd + Z` inside a
 * field would undo somebody's last component instead of the character they just
 * typed.
 *
 * `preventDefault()` is called **only on an event this hook actually handles**, so
 * every other key keeps its browser behaviour: `Cmd/Ctrl + -` and `Cmd/Ctrl + =`
 * still zoom the *page*, which is a browser accessibility feature and not this
 * canvas' to take over.
 */
export function useKeyboardShortcuts(
  actions: CanvasKeyboardShortcutActions
): void {
  /*
   * The actions are read through a ref so the listener can be registered once for
   * the life of the canvas. Passing them as effect dependencies instead would tear
   * the listener down and add a new one whenever a caller re-rendered with fresh
   * callbacks, which is a subscription churn no shortcut needs.
   */
  const actionsRef = useRef(actions);

  useEffect(() => {
    actionsRef.current = actions;
  });

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      /*
       * Something nearer the key has already dealt with it — a dialog closing on
       * Escape, say. A shortcut is the default behaviour of the canvas, so it gives
       * way rather than running a second action for one keypress.
       */
      if (event.defaultPrevented) {
        return;
      }

      if (isEditableEventTarget(event.target)) {
        return;
      }

      /*
       * `metaKey` and `ctrlKey` are treated as the same modifier, which is what makes
       * one binding correct on macOS and on Windows: the platform is not detected
       * anywhere, so nothing has to be kept in step with it.
       */
      const hasHistoryModifier = event.metaKey || event.ctrlKey;

      if (hasHistoryModifier) {
        /*
         * Lower-cased because `Shift` is part of the redo binding and the browser
         * reports the shifted character: `Cmd + Shift + Z` arrives as `Z`, not `z`.
         */
        const key = event.key.toLowerCase();

        if (key === "z") {
          event.preventDefault();

          if (event.shiftKey) {
            actionsRef.current.onRedo();
          } else {
            actionsRef.current.onUndo();
          }

          return;
        }

        if (key === "y") {
          event.preventDefault();
          actionsRef.current.onRedo();
        }

        /*
         * Every other modified key returns untouched, and this is the branch that
         * keeps `Cmd/Ctrl + =` and `Cmd/Ctrl + -` out of the canvas: they are the
         * browser's page-zoom shortcuts, and the canvas zoom is the *unmodified*
         * key.
         */
        return;
      }

      /*
       * `Alt` makes a different character on several layouts, so a zoom shortcut is
       * the plain key or the plain key with `Shift` — which is how `+` is typed at
       * all on most of them — and nothing else.
       */
      if (event.altKey) {
        return;
      }

      /*
       * `=` shares its physical key with `+`, so both zoom in: on a layout where the
       * plus sign needs `Shift`, pressing that key without it is still the gesture
       * the user means. `event.key` is the character produced, so the number row and
       * the numeric keypad both arrive here as `+` or `-` with nothing to special-case.
       */
      if (event.key === "+" || event.key === "=") {
        event.preventDefault();
        actionsRef.current.onZoomIn();
        return;
      }

      if (event.key === "-") {
        event.preventDefault();
        actionsRef.current.onZoomOut();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
}

/**
 * Whether a keypress belongs to something being typed into rather than to the canvas.
 *
 * True for an `input`, a `textarea`, a `select`, and anything inside a
 * `contenteditable` region — which covers the node label editor from unit 14, the
 * connection label editor from unit 16, and every field in the navbar and the
 * dialogs above the canvas.
 *
 * `closest` is what makes it "is, or is inside": a keypress inside a composite
 * control reports the inner element as its target, so testing the target's own tag
 * name alone would let the shortcut through. `isContentEditable` is used for the
 * editable case rather than an attribute selector because the property is inherited
 * — it is true on a descendant of the editable element, which is where the target
 * actually is — and it is already false for `contenteditable="false"`.
 */
function isEditableEventTarget(target: EventTarget | null): boolean {
  /*
   * A keypress on the document body, or on the window itself, has no element to
   * inspect. Neither is a text field, so the shortcut runs.
   */
  if (!(target instanceof Element)) {
    return false;
  }

  if (target.closest("input, textarea, select")) {
    return true;
  }

  return target instanceof HTMLElement && target.isContentEditable;
}
