// Curved layout: a scene with `curved: true` publishes its globe as run.geo = {cx, cy, Rc}. Rows of every widget on the
// left/right of it are shifted sideways so their inner edge follows the circle of radius Rc + CURVE_GAP; widgets near the
// centre are left alone.
import type { Geo } from '../scenes/types.ts';

export const CURVE_GAP = 44;

/** Which side of the globe a widget centred at `mid` is on: -1 left, 1 right, 0 too close to the middle to bend. */
export const curveSide = (mid: number, cx: number, vw: number) => Math.abs(mid - cx) < vw * .12 ? 0 : mid < cx ? -1 : 1;

/** Horizontal shift (screen px) that puts a row at height `y` with box edges [left, right] against the circle. */
export function curveShift(geo: Geo, side: number, y: number, left: number, right: number){
  const R = geo.Rc + CURVE_GAP, dy = y - geo.cy, ax = Math.sqrt(Math.max(R * R - dy * dy, (R * .45) ** 2));
  return side < 0 ? geo.cx - ax - right : geo.cx + ax - left;
}

const rowsOf = (box: HTMLElement) => {
  const rows: HTMLElement[] = [];
  for (const c of box.querySelector('.wc')!.children as HTMLCollectionOf<HTMLElement>)
    if (c.classList.contains('bars') || c.classList.contains('cal-g')) rows.push(...(c.children as HTMLCollectionOf<HTMLElement>)); else rows.push(c);
  return rows;
};

export function uncurve(boxes: HTMLElement[]){
  for (const b of boxes){ b.classList.remove('side-l', 'side-r'); rowsOf(b).forEach(r => r.style.transform = ''); }
}

export function curve(geo: Geo, boxes: HTMLElement[]){
  for (const b of boxes){
    const r = b.getBoundingClientRect(), k = r.width / b.offsetWidth || 1, side = curveSide(r.left + r.width / 2, geo.cx, innerWidth);
    b.classList.toggle('side-l', side < 0); b.classList.toggle('side-r', side > 0);
    for (const row of rowsOf(b)){
      if (!side){ row.style.transform = ''; continue; }
      const dx = curveShift(geo, side, r.top + (row.offsetTop + row.offsetHeight / 2) * k, r.left, r.right);
      row.style.transform = `translateX(${(dx / k).toFixed(1)}px)`;
    }
  }
}
