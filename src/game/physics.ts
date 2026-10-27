/**
 * Physics, Collision Detection, Camera Shake & Hitstop Simulation
 */

import { Vector2D } from './types';
import { WallSegment, House } from './map';

export function distance(x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

export function distanceSq(x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return dx * dx + dy * dy;
}

export function pointToSegmentDistance(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): { dist: number; closestX: number; closestY: number } {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;

  if (lenSq === 0) {
    return { dist: distance(px, py, x1, y1), closestX: x1, closestY: y1 };
  }

  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lenSq));
  const closestX = x1 + t * dx;
  const closestY = y1 + t * dy;
  return { dist: distance(px, py, closestX, closestY), closestX, closestY };
}

export function resolveCircleWallCollision(
  cx: number,
  cy: number,
  radius: number,
  wall: WallSegment
): { x: number; y: number; collided: boolean } {
  const { dist, closestX, closestY } = pointToSegmentDistance(
    cx,
    cy,
    wall.x1,
    wall.y1,
    wall.x2,
    wall.y2
  );

  if (dist < radius) {
    const overlap = radius - dist;
    const nx = dist === 0 ? 0 : (cx - closestX) / dist;
    const ny = dist === 0 ? 1 : (cy - closestY) / dist;
    return {
      x: cx + nx * overlap,
      y: cy + ny * overlap,
      collided: true,
    };
  }

  return { x: cx, y: cy, collided: false };
}

export function resolveCircleHouseCollision(
  cx: number,
  cy: number,
  radius: number,
  house: House
): { x: number; y: number; collided: boolean } {
  const hLeft = house.x;
  const hRight = house.x + house.width;
  const hTop = house.y;
  const hBottom = house.y + house.height;

  // Closest point on house AABB
  const closestX = Math.max(hLeft, Math.min(cx, hRight));
  const closestY = Math.max(hTop, Math.min(cy, hBottom));

  const dx = cx - closestX;
  const dy = cy - closestY;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist < radius) {
    if (dist === 0) {
      // Circle center inside house, push towards nearest edge
      const toLeft = cx - hLeft;
      const toRight = hRight - cx;
      const toTop = cy - hTop;
      const toBottom = hBottom - cy;
      const minEdge = Math.min(toLeft, toRight, toTop, toBottom);

      if (minEdge === toLeft) return { x: hLeft - radius, y: cy, collided: true };
      if (minEdge === toRight) return { x: hRight + radius, y: cy, collided: true };
      if (minEdge === toTop) return { x: cx, y: hTop - radius, collided: true };
      return { x: cx, y: hBottom + radius, collided: true };
    }

    const overlap = radius - dist;
    return {
      x: cx + (dx / dist) * overlap,
      y: cy + (dy / dist) * overlap,
      collided: true,
    };
  }

  return { x: cx, y: cy, collided: false };
}

export class ScreenShaker {
  private trauma: number = 0;
  private maxOffset: number = 16;
  private maxAngle: number = 0.05; // radians

  public addTrauma(amount: number) {
    this.trauma = Math.min(1.0, this.trauma + amount);
  }

  public update(dt: number) {
    if (this.trauma > 0) {
      this.trauma = Math.max(0, this.trauma - dt * 1.8);
    }
  }

  public getOffset(): { offsetX: number; offsetY: number; angle: number } {
    if (this.trauma <= 0) return { offsetX: 0, offsetY: 0, angle: 0 };
    const shake = this.trauma * this.trauma; // Non-linear decay feels punchier
    const offsetX = (Math.random() * 2 - 1) * this.maxOffset * shake;
    const offsetY = (Math.random() * 2 - 1) * this.maxOffset * shake;
    const angle = (Math.random() * 2 - 1) * this.maxAngle * shake;
    return { offsetX, offsetY, angle };
  }
}

export class HitStopManager {
  private stopTimer: number = 0;

  public trigger(durationSeconds: number = 0.06) {
    this.stopTimer = durationSeconds;
  }

  public update(dt: number): boolean {
    if (this.stopTimer > 0) {
      this.stopTimer -= dt;
      return true; // Is paused / hitstopped
    }
    return false;
  }
}
