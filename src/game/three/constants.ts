/**
 * Coordinate transformations between 2D suburban map (3200x2200) and 3D world space.
 */

export const MAP_CENTER_X = 1600;
export const MAP_CENTER_Y = 1100;
export const SCALE_3D = 0.1; // 10 units in 2D = 1 meter in 3D

/** Convert 2D map X to 3D world X */
export function to3DX(x: number): number {
  return (x - MAP_CENTER_X) * SCALE_3D;
}

/** Convert 2D map Y to 3D world Z */
export function to3DZ(y: number): number {
  return (y - MAP_CENTER_Y) * SCALE_3D;
}

/** Convert 3D world X to 2D map X */
export function from3DX(X: number): number {
  return X / SCALE_3D + MAP_CENTER_X;
}

/** Convert 3D world Z to 2D map Y */
export function from3DZ(Z: number): number {
  return Z / SCALE_3D + MAP_CENTER_Y;
}

/** Convert 2D map radius to 3D world radius */
export function to3DRadius(r: number): number {
  return r * SCALE_3D;
}
