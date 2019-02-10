class Intersection {

  constructor(ray, rect, x, y) {
    this.rect = rect, this.x = x, this.y = y;
    this.distSquared = (ray.ox - x) * (ray.ox - x) + (ray.oy - y) * (ray.oy - y);
  }

}

class Ray {

  constructor(ox, oy, dx, dy) {
    this.ox = ox, this.oy = oy, this.dx = dx, this.dy = dy;
  }

  intersect(rects) {
    // o - origin; d - difference/delta; f - far
    const {ox, oy, dx, dy} = this;
    if (dx === 0 && dy === 0) return [];
    const intersections = [];
    rects.forEach(rect => {
      const {x, y, width, height} = rect;
      const fx = x + width;
      const fy = y + height;
      if (dx === 0) {
        if (ox >= x && ox < fx) {
          if (Math.sign(y - oy) === Math.sign(dy) || y === oy)
            intersections.push(new Intersection(this, rect, ox, y));
          if (Math.sign(fy - oy) === Math.sign(dy))
            intersections.push(new Intersection(this, rect, ox, fy));
        }
      } else if (dy === 0) {
        if (oy >= y && oy < fy) {
          if (Math.sign(x - ox) === Math.sign(dx) || x === ox)
            intersections.push(new Intersection(this, rect, x, oy));
          if (Math.sign(fx - ox) === Math.sign(dx))
            intersections.push(new Intersection(this, rect, fx, oy));
        }
      } else {
        let temp;
        temp = (x - ox) * dy / dx + oy;
        if (temp >= y && temp < fy && Math.sign(x - ox) === Math.sign(dx) || x === ox)
          intersections.push(new Intersection(this, rect, x, temp));
        temp = (fx - ox) * dy / dx + oy;
        if (temp >= y && temp < fy && Math.sign(fx - ox) === Math.sign(dx))
          intersections.push(new Intersection(this, rect, fx, temp));
        temp = (y - oy) * dx / dy + ox;
        if (temp >= x && temp < fx && Math.sign(y - oy) === Math.sign(dy) || y === oy)
          intersections.push(new Intersection(this, rect, temp, y));
        temp = (fy - oy) * dx / dy + ox;
        if (temp >= x && temp < fx && Math.sign(fy - oy) === Math.sign(dy))
          intersections.push(new Intersection(this, rect, temp, fy));
      }
    });
    intersections.sort((a, b) => a.distSquared - b.distSquared);
    return intersections;
  }

}
