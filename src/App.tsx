import { useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "canvas-to-image";

interface Container {
  width: number;
  height: number;
  details: Element[];
}

interface Element {
  id: number;
  width: number;
  height: number;
  color?: string;
}

export const App3 = () => {
  const [elements, setElements] = useState<Element[]>([]);
  const [containers, setContainers] = useState<Container[]>([]);
  const [containerHeight, setContainerHeight] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  const [unusedSpace, setUnusedSpace] = useState(0);

  const handleContainerSizeChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { value } = e.target;
    const [width, height] = value.split("x").map(Number);
    setContainerWidth(width);
    setContainerHeight(height);
  };

  const handleElementSizeChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;

    if (name === "width" && +value < containerWidth) {
      const updatedElements = [...elements];
      const element = updatedElements[index];
      element[name] = value;
      setElements(updatedElements);
      return;
    }
    return alert("Ширина детали не может быть больше ширины контейнера");
  };

  const addElement = () => {
    const newElement: Element = {
      id: elements.length + 1,
      width: 0,
      height: containerHeight,
    };
    setElements([...elements, newElement]);
  };

  const calculateLayout = () => {
    let currentContainer: Container = {
      width: containerWidth,
      height: containerHeight,
      details: [],
    };
    const updatedContainers: Container[] = [currentContainer];

    for (const element of elements) {
      let placed = false;

      for (const container of updatedContainers) {
        if (container.width >= element.width) {
          container.details.push(element);
          container.width -= element.width;
          placed = true;
          break;
        }
      }

      if (!placed) {
        const remainingWidth = containerWidth - element.width;
        if (remainingWidth >= 0) {
          currentContainer = {
            width: remainingWidth,
            height: containerHeight,
            details: [element],
          };
          updatedContainers.push(currentContainer);
        }
      }
    }

    let totalUsedWidth = 0;
    for (const container of updatedContainers) {
      totalUsedWidth += container.width;
    }
    const totalUsedSpace = containers.length * containerWidth - totalUsedWidth;
    const usedSpacePercentage = (totalUsedSpace / containerWidth) * 100;
    const unusedSpacePercentage = 100 - usedSpacePercentage;

    setContainers(updatedContainers);
    setUnusedSpace(unusedSpacePercentage);
  };
  const generatePDF = () => {
    const exportToPDF = async () => {
      const chartContainer = document.querySelector(".canvas");
      const canvas = await html2canvas(chartContainer);
      const imgData = canvas.toDataURL("image/jpeg", 1.0);
      const pdf = new jsPDF();

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("example.pdf");
    };

    exportToPDF();
  };

  return (
    <div style={{ position: "absolute", left: "40%", top: "20%" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          flexDirection: "column",
          justifyContent: "center",
          alignSelf: "center",
        }}
      >
        <h1>Linear Nesting Example</h1>
        <div>
          <button onClick={addElement}>Импортировать размер</button>
          <label htmlFor="containerSize">
            Размер холста (ширина x высота):
          </label>
          <input
            type="text"
            id="containerSize"
            onChange={handleContainerSizeChange}
          />
        </div>
        <h2>Элементы:</h2>
        {elements.map((element, index) => (
          <div key={element.id}>
            <label htmlFor={`elementWidth${element.id}`}>
              Ширина элемента {element.id}:
            </label>
            <input
              type="number"
              id={`elementWidth${element.id}`}
              name="width"
              onChange={(e) => handleElementSizeChange(index, e)}
            />
            <label htmlFor={`elementWidth${element.id}`}>
              Длинна элемента {element.id}:
            </label>
            <input
              type="number"
              contentEditable="false"
              id={`elementWidth${element.id}`}
              name="height"
              value={containerHeight}
              onChange={(e) => handleElementSizeChange(index, e)}
            />
            <label htmlFor={`elementWidth${element.id}`}>
              Цвет элемента {element.id}:
            </label>
            <input
              id={`elementColor${element.id}`}
              name="color"
              onChange={(e) => handleElementSizeChange(index, e)}
            />
          </div>
        ))}
        <div
          style={{
            width: 500,
            display: "flex",
            justifyContent: "space-around",
          }}
        >
          <button onClick={addElement}>Добавить элемент</button>
          {elements.length > 0 && (
            <button onClick={calculateLayout}>Рассчитать</button>
          )}
          <button onClick={generatePDF}>Сохранить в PDF</button>
        </div>
        <div>
          <p>Неиспользуемое пространство: {unusedSpace.toFixed(2)}%</p>
        </div>
      </div>
      {containers.length > 0 && (
        <div className="canvas">
          {containers.map((container) => (
            <div
              key={container.width}
              className="container"
              style={{
                display: "flex",
                flexDirection: "row",
                flexWrap: "wrap",

                marginTop: 20,

                width: `${containerWidth}px`,
                height: `${containerHeight}px`,
                backgroundColor: "cyan",
              }}
            >
              {container.details.map((element) => (
                <div
                  key={element.id}
                  className="element"
                  style={{
                    width: `${element.width - 2}px`,
                    height: `${element.height - 2}px`,
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 8,
                    border: "1px solid blue",
                    color: "black",
                    backgroundColor: element.color || "lightblue",
                  }}
                >
                  <p style={{ fontSize: 8, color: "black" }}>{element.id}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
