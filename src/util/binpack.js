// @flow

export default function binpack(boxes: Array<{w: number, h: number, x?: number, y?: number}>) {
    let area = 0;
    let maxWidth = 0;

    for (const box of boxes) {
        area += box.w * box.h;
        maxWidth = Math.max(maxWidth, box.w);
    }

    // sort the boxes for insertion by height, descending
    boxes.sort((a, b) => b.h - a.h);

    // aim for a squarish resulting container,
    // slightly adjusted for sub-100% space utilization
    const startWidth = Math.max(Math.ceil(Math.sqrt(area / 0.95)), maxWidth);

    // start with a single empty space, unbounded at the bottom
    const spaces = [{x: 0, y: 0, w: startWidth, h: Infinity}];

    let width = 0;
    let height = 0;

    for (const box of boxes) {
        for (let i = spaces.length - 1; i >= 0; i--) {
            const space = spaces[i];

            // look for empty spaces that can accommodate the current box
            if (box.w > space.w || box.h > space.h) continue;

            // found the space; add the box to its top-left corner
            // |-------|-------|
            // |  box  |       |
            // |_______|       |
            // |         space |
            // |_______________|
            box.x = space.x;
            box.y = space.y;

            height = Math.max(height, box.y + box.h);
            width = Math.max(width, box.x + box.w);

            // if the space matches the box exactly, just remove it
            if (box.w === space.w && box.h === space.h) {
                const last = spaces.pop();
                if (i < spaces.length) spaces[i] = last;

            // if it matches the box height, update the space accordingly
            // |-------|---------------|
            // |  box  | updated space |
            // |_______|_______________|
            } else if (box.h === space.h) {
                space.x += box.w;
                space.w -= box.w;

            // if it matches the box width, update the space accordingly
            // |---------------|
            // |      box      |
            // |_______________|
            // | updated space |
            // |_______________|
            } else if (box.w === space.w) {
                space.y += box.h;
                space.h -= box.h;

            // otherwise, update the space accordingly and a new one
            // |-------|-----------|
            // |  box  | new space |
            // |_______|___________|
            // | updated space     |
            // |___________________|
            } else {
                spaces.push({
                    x: space.x + box.w,
                    y: space.y,
                    w: space.w - box.w,
                    h: box.h
                });
                space.y += box.h;
                space.h -= box.h;
            }
            break;
        }
    }

    return {w: width, h: height};
}
