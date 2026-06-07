import { useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent } from "react";
import type { BoardCell, BoardItem, GameState } from "../types/game";
import { canMerge, itemAtCell } from "../game/gameReducer";

type DragOptions = {
  state: GameState;
  onMove: (itemId: string, toCell: BoardCell) => void;
  onMerge: (sourceId: string, targetId: string) => void;
};

type DragState = {
  id: string;
  x: number;
  y: number;
  moved: boolean;
};

function cellFromPoint(x: number, y: number): BoardCell | null {
  if (typeof document === "undefined") return null;
  const element = document.elementFromPoint(x, y);
  if (element instanceof Element) {
    const cellElement = element.closest("[data-board-cell]");
    if (cellElement instanceof HTMLElement) {
      const cell = Number(cellElement.dataset.boardCell);
      return Number.isInteger(cell) ? cell : null;
    }
  }
  const boardElement = document.querySelector("[data-merge-board]");
  if (!(boardElement instanceof HTMLElement)) return null;
  const size = Number(boardElement.dataset.boardSize);
  if (!Number.isInteger(size) || size <= 0) return null;
  const rect = boardElement.getBoundingClientRect();
  if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) return null;
  const column = Math.min(size - 1, Math.max(0, Math.floor(((x - rect.left) / rect.width) * size)));
  const row = Math.min(size - 1, Math.max(0, Math.floor(((y - rect.top) / rect.height) * size)));
  return row * size + column;
}

function releasePointerCapture(element: HTMLElement, pointerId: number) {
  if (element.hasPointerCapture?.(pointerId)) {
    element.releasePointerCapture(pointerId);
  }
}

function capturePointer(element: HTMLElement, pointerId: number) {
  if (!element.hasPointerCapture?.(pointerId)) {
    element.setPointerCapture?.(pointerId);
  }
}

export function useDragMerge({ state, onMove, onMerge }: DragOptions) {
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [hoverCell, setHoverCell] = useState<BoardCell | null>(null);
  const [selectedId, setSelectedIdState] = useState<string>("");
  const selectedRef = useRef("");
  const stateRef = useRef(state);
  stateRef.current = state;

  function setSelectedId(value: string) {
    selectedRef.current = value;
    setSelectedIdState(value);
  }

  function dropItemOnCell(sourceId: string, cell: BoardCell) {
    const currentState = stateRef.current;
    const source = currentState.items.find((item) => item.id === sourceId);
    const target = itemAtCell(currentState, cell);
    if (!source) return;
    if (target && canMerge(source, target)) onMerge(source.id, target.id);
    else if (!target && source.cell !== cell) onMove(source.id, cell);
    setSelectedId("");
  }

  function dropSelectedOnCell(cell: BoardCell) {
    const sourceId = selectedRef.current;
    if (!sourceId) return;
    dropItemOnCell(sourceId, cell);
  }

  function handleTap(item: BoardItem) {
    const sourceId = selectedRef.current;
    if (sourceId && sourceId !== item.id) {
      const source = stateRef.current.items.find((entry) => entry.id === sourceId);
      if (canMerge(source, item)) onMerge(sourceId, item.id);
      setSelectedId("");
      return;
    }
    setSelectedId(item.id);
  }

  function itemProps(item: BoardItem) {
    return {
      onClick: (event: ReactMouseEvent) => {
        event.stopPropagation();
      },
      onPointerDown: (event: ReactPointerEvent) => {
        if (event.button !== 0) return;
        event.preventDefault();
        event.stopPropagation();

        const pointerTarget = event.currentTarget as HTMLElement;
        capturePointer(pointerTarget, event.pointerId);
        const sourceId = item.id;
        const startX = event.clientX;
        const startY = event.clientY;
        let moved = false;

        setDragState({ id: sourceId, x: startX, y: startY, moved: false });
        setHoverCell(item.cell);

        const handleMove = (moveEvent: PointerEvent) => {
          moveEvent.preventDefault();
          const distance = Math.hypot(moveEvent.clientX - startX, moveEvent.clientY - startY);
          moved = moved || distance > 5;
          setDragState({ id: sourceId, x: moveEvent.clientX, y: moveEvent.clientY, moved });
          setHoverCell(cellFromPoint(moveEvent.clientX, moveEvent.clientY));
        };

        const handleUp = (upEvent: PointerEvent) => {
          window.removeEventListener("pointermove", handleMove);
          window.removeEventListener("pointerup", handleUp);
          window.removeEventListener("pointercancel", handleCancel);
          releasePointerCapture(pointerTarget, upEvent.pointerId);
          setDragState(null);
          setHoverCell(null);

          if (moved) {
            const cell = cellFromPoint(upEvent.clientX, upEvent.clientY);
            if (cell !== null) dropItemOnCell(sourceId, cell);
            else setSelectedId("");
            return;
          }

          handleTap(item);
        };

        const handleCancel = () => {
          window.removeEventListener("pointermove", handleMove);
          window.removeEventListener("pointerup", handleUp);
          window.removeEventListener("pointercancel", handleCancel);
          releasePointerCapture(pointerTarget, event.pointerId);
          setDragState(null);
          setHoverCell(null);
        };

        window.addEventListener("pointermove", handleMove);
        window.addEventListener("pointerup", handleUp);
        window.addEventListener("pointercancel", handleCancel);
      },
    };
  }

  function cellProps(cell: BoardCell) {
    return {
      "data-board-cell": String(cell),
      onClick: () => dropSelectedOnCell(cell),
    };
  }

  const dragItem = dragState ? state.items.find((item) => item.id === dragState.id) : undefined;

  return {
    draggingId: dragState?.id ?? "",
    selectedId,
    hoverCell,
    dragGhost: dragState?.moved && dragItem ? { item: dragItem, x: dragState.x, y: dragState.y } : null,
    itemProps,
    cellProps,
  };
}
