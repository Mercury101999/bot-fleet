export interface NodePosition {
  id: string;
  x: number;
  y: number;
}

export interface FleetLayout {
  positions: NodePosition[];
  width: number;
  height: number;
  columns: number;
}

export interface Segment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  labelX: number;
  labelY: number;
}

export function layoutFleet(ids: string[], width: number): FleetLayout {
  const safeWidth = Math.max(280, width);
  const columns = Math.max(1, Math.min(ids.length || 1, safeWidth >= 840 ? 4 : safeWidth >= 560 ? 3 : 2));
  const rowHeight = 148;
  const positions = ids.map((id, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);
    const columnWidth = safeWidth / columns;
    return {
      id,
      x: columnWidth * column + columnWidth / 2,
      y: row * rowHeight + 64,
    };
  });
  const rows = Math.max(1, Math.ceil(ids.length / columns));
  return { positions, width: safeWidth, height: rows * rowHeight + 16, columns };
}

/**
 * Shorten a center-to-center line so the arrow stops at the node edge.
 * `nameClearance` pushes a downward line below the name under the source node.
 */
export function segmentBetween(from: NodePosition, to: NodePosition, radius: number, nameClearance = 0): Segment {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy) || 1;
  const ux = dx / length;
  const uy = dy / length;
  const gap = radius + 8;
  let startDistance = radius;
  if (nameClearance > 0 && uy > 0.25) {
    startDistance = Math.min((radius + nameClearance) / uy, length * 0.42);
  }
  const vertical = Math.abs(dx) < Math.abs(dy);
  return {
    x1: from.x + ux * startDistance,
    y1: from.y + uy * startDistance,
    x2: to.x - ux * gap,
    y2: to.y - uy * gap,
    labelX: (from.x + to.x) / 2 + (vertical ? 42 : 0),
    labelY: (from.y + to.y) / 2 + (vertical ? 0 : -14),
  };
}

export function arrowPoints(x1: number, y1: number, x2: number, y2: number, size = 9): string {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const tip = [x2, y2];
  const left = [x2 - size * Math.cos(angle - 0.42), y2 - size * Math.sin(angle - 0.42)];
  const right = [x2 - size * Math.cos(angle + 0.42), y2 - size * Math.sin(angle + 0.42)];
  return [tip, left, right].map((point) => point.map((value) => value.toFixed(2)).join(',')).join(' ');
}
