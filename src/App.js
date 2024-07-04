import React from "react";

import { Minus, Mouse, Square } from "lucide-react";
import { useLayoutEffect, useState } from "react";
import rough from "roughjs";
const generator = rough.generator();
const CreateElement = (id, x1, y1, x2, y2, type) => {
  const roughElement =
    type === "line"
      ? generator.line(x1, y1, x2, y2)
      : generator.rectangle(x1, y1, x2 - x1, y2 - y1);
  return { id, x1, y1, x2, y2, type, roughElement };
};
const distance = (a, b) =>
  Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
const iswithinelement = (x, y, element) => {
  const { x1, y1, x2, y2, type } = element;

  if (type === "rectangle") {
    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);
    console.log(minX);
    return x >= minX && x <= maxX && y <= maxY && y >= minY;
  } else {
    const c = { x, y };
    const a = { x: x1, y: y1 };
    const b = { x: x2, y: y2 };
    console.log(a, c, b);
    const offset = distance(a, b) - (distance(a, c) + distance(c, b));
    console.log(offset);
    return Math.abs(offset) < 1;
  }
};

const getElementAtPosition = (x, y, elements) => {
  return elements.find((element) => iswithinelement(x, y, element));
};
export default function Home() {
  const [elements, setelements] = useState([]);
  const [action, setAction] = useState("none");
  const [elementType, setElementType] = useState("line");
  const [tool, setTool] = useState("line");
  const [selectedElement, setSelectedElement] = useState();
  const [activeindex, setindex] = useState(0);
  // const [ac,setdrawing]= useState(false);

  useLayoutEffect(() => {
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const roughcanvas = rough.canvas(canvas);
    elements.forEach(({ roughElement }) => roughcanvas.draw(roughElement));
  }, [elements]);

  const handleMouseDown = (event) => {
    const { clientX, clientY } = event;

    if (tool === "selection") {
      const element = getElementAtPosition(clientX, clientY, elements);
      setSelectedElement(element);

      if (element) {
        console.log(element);
        setAction("moving");
      }
    } else {
      setAction("drawing");
      const id = elements[elements.length];
      const intialpoint = CreateElement(
        id,
        clientX,
        clientY,
        clientX,
        clientY,
        elementType
      );
      setelements((oldstate) => [...oldstate, intialpoint]);
    }
  };

  const updateElement = (id, x1, y1, x2, y2, type) => {
    const element = CreateElement(id, x1, y1, x2, y2, type);
    const oldelements = [...elements];
    oldelements[id] = element;
    setelements(oldelements);
  };
  const handleMouseMove = (event) => {
    const { clientX, clientY } = event;

    if (action === "drawing") {
      const index = elements.length - 1;
      const { x1, y1 } = elements[index];
      updateElement(index, x1, y1, clientX, clientY, tool);

      setAction("drawing");
    } else if (action === "moving") {
      const { id, x1, y1, x2, y2, type } = selectedElement;
      const width = x2 - x1;
      const height = y2 - y1;
      updateElement(
        id,
        clientX,
        clientY,
        clientX + width,
        clientY + height,
        type
      );
    }
  };

  const handleMouseUp = (event) => {
    setAction("none");
  };

  const tools = [
    {
      tool: "selection",
      icon: Mouse,
    },
    {
      tool: "rectangle",
      icon: Square,
    },
    {
      tool: "line",
      icon: Minus,
    },
  ];

  return (
    <div>
      <div className="absolute left-1/2">
        <div className="flex gap-x-3 px-5">
          {tools.map((tool, index) => (
            <button
              key={index}
              onClick={() => {
                setTool(tool.tool);
                setindex(index);
              }}
              className={`px-3 py-4 ${
                activeindex === index
                  ? "bg-blue-600 text-white"
                  : "bg-black text-white"
              }`}
            >
              <tool.icon />
            </button>
          ))}
        </div>
      </div>
      <canvas
        id="canvas"
        width={window.innerWidth}
        height={window.innerHeight}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        canvas
      </canvas>
    </div>
  );
}
