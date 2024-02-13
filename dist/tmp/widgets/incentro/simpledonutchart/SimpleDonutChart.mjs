import { useState, useRef, useEffect, createElement } from 'react';

function SimpleDonutChart({
  buttonAction,
  context,
  chartValue,
  colors,
  customSortOrder,
  chartName,
  displayPercentages,
  displayTotal,
  displayValues,
  legendTitle,
  sortAttribute,
  sortOrder,
  unit,
  unitPosition
}) {
  const [canRender, setCanRender] = useState(false);
  const containerRef = useRef([]);
  const tooltipRef = useRef([]);
  const colorArray = ["#003f5c", "#665191", "#a05195", "#d45087", "#f95d6a", "#ff7c43", "#ffa600"];
  const [total, setTotal] = useState(0);
  const strokeWidth = 4;
  const percentageRotate = [];
  let currentIndex = 0;
  let preSegmentsTotalLength = 0;
  let sortInstrs = [];
  function setTooltipPosition(event) {
    const cursorSize = 32 / 2;
    const x = event.offsetX + cursorSize + 80;
    const y = event.offsetY - cursorSize + 80;
    tooltipRef.current[currentIndex].style.setProperty("--x", `${x}px`);
    tooltipRef.current[currentIndex].style.setProperty("--y", `${y}px`);
  }
  function getChartNumberValue(index) {
    const rawValue = chartValue.get(context.items[index]).displayValue;
    return Number(rawValue.replace(/,/g, "."));
  }
  function showHghlightPart(currentContainer) {
    currentContainer.style.strokeWidth = strokeWidth + 2;
  }
  const hideHighlightPart = currentContainer => {
    currentContainer.style.strokeWidth = null;
  };
  const showTooltip = (index, currentContainer) => {
    tooltipRef.current[index].classList.add("show-tooltip");
    currentIndex = index;
    showHghlightPart(currentContainer);
    document.addEventListener("mousemove", setTooltipPosition);
  };
  const hideTooltip = (index, currentContainer) => {
    tooltipRef.current[index].classList.remove("show-tooltip");
    currentIndex = 0;
    hideHighlightPart(currentContainer);
    document.removeEventListener("mousemove", setTooltipPosition);
  };
  function calcTotal() {
    const totals = [];
    context.items.map((item, index) => totals.push(getChartNumberValue(index)));
    setTotal(totals.reduce((a, b) => a + b, 0));
  }
  function setSortOrder() {
    if (!customSortOrder && sortAttribute === "chartName" && chartName.sortable) {
      sortInstrs = [[chartName.id, sortOrder]];
    } else if (!customSortOrder && sortAttribute === "chartValue" && chartValue.sortable) {
      sortInstrs = [[chartValue.id, sortOrder]];
    } else if (customSortOrder && customSortOrder.sortable) {
      sortInstrs = [[customSortOrder.id, sortOrder]];
    }
    context.setSortOrder(sortInstrs);
  }
  function onClick(index, currentContainer) {
    const donutAction = buttonAction.get(context.items[index]);
    if (donutAction && donutAction.canExecute) {
      hideTooltip(index, currentContainer);
      donutAction.execute();
    }
  }
  function segmentTotalLength(index, startAngle) {
    const thisTotal = preSegmentsTotalLength * 360 / total + startAngle;
    preSegmentsTotalLength += getChartNumberValue(index);
    return thisTotal;
  }
  function rotatePercentage(index) {
    const thisTotal = segmentTotalLength(index, 0) + getChartNumberValue(index) * 360 / total / 2;
    percentageRotate.push(thisTotal);
    return thisTotal;
  }
  function getTextColor(bgColor) {
    var color = bgColor.charAt(0) === "#" ? bgColor.substring(1, 7) : bgColor;
    var r = parseInt(color.substring(0, 2), 16); // hexToR
    var g = parseInt(color.substring(2, 4), 16); // hexToG
    var b = parseInt(color.substring(4, 6), 16); // hexToB
    return r * 0.299 + g * 0.587 + b * 0.114 > 186 ? "#000" : "#fff";
  }
  useEffect(() => {
    if (context && context.status === "available" && context.items.length > 0) {
      setSortOrder();
      calcTotal();
    }
  });
  useEffect(() => {
    if (context && context.status === "available" && context.items.length > 0) {
      setCanRender(true);
    }
  }, [context, colors]);
  if (canRender) {
    const radius = 15.91549430918952;
    const circumference = 2 * Math.PI * radius;
    return createElement("div", {
      className: "simple-donut-chart-widget"
    }, createElement("div", {
      className: "chart-container"
    }, displayPercentages && createElement("div", {
      className: "donut-percentages"
    }, context.items.map((item, index) => createElement("div", {
      key: item,
      className: "donut-percentage",
      style: {
        transform: `rotate(${rotatePercentage(index) || 0}deg) translate(-50%, -50%)`
      }
    }, createElement("span", {
      style: {
        transform: `rotate(-${percentageRotate[index] || 0}deg)`,
        color: colors[index] ? getTextColor(colors[index].value) : getTextColor(colorArray[index])
      }
    }, getChartNumberValue(index) / total * 100 >= 5 && `${Math.round(getChartNumberValue(index) / total * 100)}%`)))), createElement("svg", {
      xmlns: "http://www.w3.org/2000/svg",
      className: "donut",
      viewBox: "0 0 40 40",
      preserveAspectRatio: "xMinYMin meet"
    }, context.items.map((item, index) => createElement("circle", {
      key: item,
      ref: element => containerRef.current[index] = element,
      name: `simpledonutchart-index-${index}`,
      onMouseEnter: () => showTooltip(index, containerRef.current[index]),
      onMouseLeave: () => hideTooltip(index, containerRef.current[index]),
      onClick: () => buttonAction && onClick(index, containerRef.current[index]),
      cx: "20",
      cy: "20",
      className: "donut-slice",
      r: radius,
      strokeWidth: strokeWidth,
      stroke: `var(--donutchart-color-${[index]}, ${colors[index] ? colors[index].value : colorArray[index]})`,
      strokeDasharray: circumference,
      strokeDashoffset: circumference - circumference * getChartNumberValue(index) / total,
      transform: `rotate(${segmentTotalLength(index, -90) || 0} 20 20)`,
      fill: "none"
    })))), createElement("div", {
      className: "simple-donut-chart-info"
    }, (displayTotal || legendTitle) && createElement("p", {
      className: "donutchart-total text-large"
    }, displayTotal && unitPosition === "before" && unit && unit, legendTitle && legendTitle.status === "available" && `${legendTitle.value} `, displayTotal && total, displayTotal && unitPosition === "after" && unit && unit), createElement("ul", {
      className: "donutchart-legend"
    }, context.items.map((item, index) => createElement("li", {
      key: item,
      name: `donutchart-legend-index-${index}`,
      onMouseEnter: () => showHghlightPart(containerRef.current[index]),
      onMouseLeave: () => hideHighlightPart(containerRef.current[index])
    }, createElement("svg", {
      width: "10",
      height: "10",
      viewBox: "0 0 10 10"
    }, createElement("circle", {
      fill: `var(--donutchart-color-${[index]}, ${colors[index] ? colors[index].value : colorArray[index]})`,
      cx: "5",
      cy: "5",
      r: "5"
    })), createElement("p", null, chartName.get(context.items[index]).displayValue), displayValues && createElement("p", {
      className: "donutchart-value"
    }, unitPosition === "before" && unit && unit, chartValue.get(context.items[index]).displayValue, unitPosition === "after" && unit && unit), createElement("div", {
      className: "donutchart-tooltip",
      ref: element => tooltipRef.current[index] = element
    }, createElement("p", null, chartName.get(context.items[index]).displayValue), displayValues && createElement("p", {
      className: "donutchart-value"
    }, unitPosition === "before" && unit && unit, chartValue.get(context.items[index]).displayValue, unitPosition === "after" && unit && unit)))))));
  } else {
    return createElement("div", {
      className: "donutchart-widget"
    });
  }
}

export { SimpleDonutChart as default };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2ltcGxlRG9udXRDaGFydC5tanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9TaW1wbGVEb251dENoYXJ0LmpzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgXCIuL3VpL1NpbXBsZURvbnV0Q2hhcnQuY3NzXCI7XG5pbXBvcnQgeyBjcmVhdGVFbGVtZW50LCB1c2VFZmZlY3QsIHVzZVJlZiwgdXNlU3RhdGUgfSBmcm9tIFwicmVhY3RcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gU2ltcGxlRG9udXRDaGFydCh7XG4gICAgYnV0dG9uQWN0aW9uLFxuICAgIGNvbnRleHQsXG4gICAgY2hhcnRWYWx1ZSxcbiAgICBjb2xvcnMsXG4gICAgY3VzdG9tU29ydE9yZGVyLFxuICAgIGNoYXJ0TmFtZSxcbiAgICBkaXNwbGF5UGVyY2VudGFnZXMsXG4gICAgZGlzcGxheVRvdGFsLFxuICAgIGRpc3BsYXlWYWx1ZXMsXG4gICAgbGVnZW5kVGl0bGUsXG4gICAgc29ydEF0dHJpYnV0ZSxcbiAgICBzb3J0T3JkZXIsXG4gICAgdW5pdCxcbiAgICB1bml0UG9zaXRpb25cbn0pIHtcbiAgICBjb25zdCBbY2FuUmVuZGVyLCBzZXRDYW5SZW5kZXJdID0gdXNlU3RhdGUoZmFsc2UpO1xuICAgIGNvbnN0IGNvbnRhaW5lclJlZiA9IHVzZVJlZihbXSk7XG4gICAgY29uc3QgdG9vbHRpcFJlZiA9IHVzZVJlZihbXSk7XG4gICAgY29uc3QgY29sb3JBcnJheSA9IFtcIiMwMDNmNWNcIiwgXCIjNjY1MTkxXCIsIFwiI2EwNTE5NVwiLCBcIiNkNDUwODdcIiwgXCIjZjk1ZDZhXCIsIFwiI2ZmN2M0M1wiLCBcIiNmZmE2MDBcIl07XG4gICAgY29uc3QgW3RvdGFsLCBzZXRUb3RhbF0gPSB1c2VTdGF0ZSgwKTtcbiAgICBjb25zdCBzdHJva2VXaWR0aCA9IDQ7XG4gICAgY29uc3QgcGVyY2VudGFnZVJvdGF0ZSA9IFtdO1xuICAgIGxldCBjdXJyZW50SW5kZXggPSAwO1xuICAgIGxldCBwcmVTZWdtZW50c1RvdGFsTGVuZ3RoID0gMDtcbiAgICBsZXQgc29ydEluc3RycyA9IFtdO1xuXG4gICAgZnVuY3Rpb24gc2V0VG9vbHRpcFBvc2l0aW9uKGV2ZW50KSB7XG4gICAgICAgIGNvbnN0IGN1cnNvclNpemUgPSAzMiAvIDI7XG4gICAgICAgIGNvbnN0IHggPSBldmVudC5vZmZzZXRYICsgY3Vyc29yU2l6ZSArIDgwO1xuICAgICAgICBjb25zdCB5ID0gZXZlbnQub2Zmc2V0WSAtIGN1cnNvclNpemUgKyA4MDtcbiAgICAgICAgdG9vbHRpcFJlZi5jdXJyZW50W2N1cnJlbnRJbmRleF0uc3R5bGUuc2V0UHJvcGVydHkoXCItLXhcIiwgYCR7eH1weGApO1xuICAgICAgICB0b29sdGlwUmVmLmN1cnJlbnRbY3VycmVudEluZGV4XS5zdHlsZS5zZXRQcm9wZXJ0eShcIi0teVwiLCBgJHt5fXB4YCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0Q2hhcnROdW1iZXJWYWx1ZShpbmRleCkge1xuICAgICAgICBjb25zdCByYXdWYWx1ZSA9IGNoYXJ0VmFsdWUuZ2V0KGNvbnRleHQuaXRlbXNbaW5kZXhdKS5kaXNwbGF5VmFsdWU7XG4gICAgICAgIHJldHVybiBOdW1iZXIocmF3VmFsdWUucmVwbGFjZSgvLC9nLCBcIi5cIikpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHNob3dIZ2hsaWdodFBhcnQoY3VycmVudENvbnRhaW5lcikge1xuICAgICAgICBjdXJyZW50Q29udGFpbmVyLnN0eWxlLnN0cm9rZVdpZHRoID0gc3Ryb2tlV2lkdGggKyAyO1xuICAgIH1cblxuICAgIGNvbnN0IGhpZGVIaWdobGlnaHRQYXJ0ID0gY3VycmVudENvbnRhaW5lciA9PiB7XG4gICAgICAgIGN1cnJlbnRDb250YWluZXIuc3R5bGUuc3Ryb2tlV2lkdGggPSBudWxsO1xuICAgIH07XG5cbiAgICBjb25zdCBzaG93VG9vbHRpcCA9IChpbmRleCwgY3VycmVudENvbnRhaW5lcikgPT4ge1xuICAgICAgICB0b29sdGlwUmVmLmN1cnJlbnRbaW5kZXhdLmNsYXNzTGlzdC5hZGQoXCJzaG93LXRvb2x0aXBcIik7XG4gICAgICAgIGN1cnJlbnRJbmRleCA9IGluZGV4O1xuICAgICAgICBzaG93SGdobGlnaHRQYXJ0KGN1cnJlbnRDb250YWluZXIpO1xuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIHNldFRvb2x0aXBQb3NpdGlvbik7XG4gICAgfTtcblxuICAgIGNvbnN0IGhpZGVUb29sdGlwID0gKGluZGV4LCBjdXJyZW50Q29udGFpbmVyKSA9PiB7XG4gICAgICAgIHRvb2x0aXBSZWYuY3VycmVudFtpbmRleF0uY2xhc3NMaXN0LnJlbW92ZShcInNob3ctdG9vbHRpcFwiKTtcbiAgICAgICAgY3VycmVudEluZGV4ID0gMDtcbiAgICAgICAgaGlkZUhpZ2hsaWdodFBhcnQoY3VycmVudENvbnRhaW5lcik7XG4gICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgc2V0VG9vbHRpcFBvc2l0aW9uKTtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gY2FsY1RvdGFsKCkge1xuICAgICAgICBjb25zdCB0b3RhbHMgPSBbXTtcbiAgICAgICAgY29udGV4dC5pdGVtcy5tYXAoKGl0ZW0sIGluZGV4KSA9PiB0b3RhbHMucHVzaChnZXRDaGFydE51bWJlclZhbHVlKGluZGV4KSkpO1xuICAgICAgICBzZXRUb3RhbCh0b3RhbHMucmVkdWNlKChhLCBiKSA9PiBhICsgYiwgMCkpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHNldFNvcnRPcmRlcigpIHtcbiAgICAgICAgaWYgKCFjdXN0b21Tb3J0T3JkZXIgJiYgc29ydEF0dHJpYnV0ZSA9PT0gXCJjaGFydE5hbWVcIiAmJiBjaGFydE5hbWUuc29ydGFibGUpIHtcbiAgICAgICAgICAgIHNvcnRJbnN0cnMgPSBbW2NoYXJ0TmFtZS5pZCwgc29ydE9yZGVyXV07XG4gICAgICAgIH0gZWxzZSBpZiAoIWN1c3RvbVNvcnRPcmRlciAmJiBzb3J0QXR0cmlidXRlID09PSBcImNoYXJ0VmFsdWVcIiAmJiBjaGFydFZhbHVlLnNvcnRhYmxlKSB7XG4gICAgICAgICAgICBzb3J0SW5zdHJzID0gW1tjaGFydFZhbHVlLmlkLCBzb3J0T3JkZXJdXTtcbiAgICAgICAgfSBlbHNlIGlmIChjdXN0b21Tb3J0T3JkZXIgJiYgY3VzdG9tU29ydE9yZGVyLnNvcnRhYmxlKSB7XG4gICAgICAgICAgICBzb3J0SW5zdHJzID0gW1tjdXN0b21Tb3J0T3JkZXIuaWQsIHNvcnRPcmRlcl1dO1xuICAgICAgICB9XG4gICAgICAgIGNvbnRleHQuc2V0U29ydE9yZGVyKHNvcnRJbnN0cnMpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIG9uQ2xpY2soaW5kZXgsIGN1cnJlbnRDb250YWluZXIpIHtcbiAgICAgICAgY29uc3QgZG9udXRBY3Rpb24gPSBidXR0b25BY3Rpb24uZ2V0KGNvbnRleHQuaXRlbXNbaW5kZXhdKTtcbiAgICAgICAgaWYgKGRvbnV0QWN0aW9uICYmIGRvbnV0QWN0aW9uLmNhbkV4ZWN1dGUpIHtcbiAgICAgICAgICAgIGhpZGVUb29sdGlwKGluZGV4LCBjdXJyZW50Q29udGFpbmVyKTtcbiAgICAgICAgICAgIGRvbnV0QWN0aW9uLmV4ZWN1dGUoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHNlZ21lbnRUb3RhbExlbmd0aChpbmRleCwgc3RhcnRBbmdsZSkge1xuICAgICAgICBjb25zdCB0aGlzVG90YWwgPSAocHJlU2VnbWVudHNUb3RhbExlbmd0aCAqIDM2MCkgLyB0b3RhbCArIHN0YXJ0QW5nbGU7XG4gICAgICAgIHByZVNlZ21lbnRzVG90YWxMZW5ndGggKz0gZ2V0Q2hhcnROdW1iZXJWYWx1ZShpbmRleCk7XG4gICAgICAgIHJldHVybiB0aGlzVG90YWw7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcm90YXRlUGVyY2VudGFnZShpbmRleCkge1xuICAgICAgICBjb25zdCB0aGlzVG90YWwgPSBzZWdtZW50VG90YWxMZW5ndGgoaW5kZXgsIDApICsgKGdldENoYXJ0TnVtYmVyVmFsdWUoaW5kZXgpICogMzYwKSAvIHRvdGFsIC8gMjtcbiAgICAgICAgcGVyY2VudGFnZVJvdGF0ZS5wdXNoKHRoaXNUb3RhbCk7XG4gICAgICAgIHJldHVybiB0aGlzVG90YWw7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0VGV4dENvbG9yKGJnQ29sb3IpIHtcbiAgICAgICAgdmFyIGNvbG9yID0gYmdDb2xvci5jaGFyQXQoMCkgPT09IFwiI1wiID8gYmdDb2xvci5zdWJzdHJpbmcoMSwgNykgOiBiZ0NvbG9yO1xuICAgICAgICB2YXIgciA9IHBhcnNlSW50KGNvbG9yLnN1YnN0cmluZygwLCAyKSwgMTYpOyAvLyBoZXhUb1JcbiAgICAgICAgdmFyIGcgPSBwYXJzZUludChjb2xvci5zdWJzdHJpbmcoMiwgNCksIDE2KTsgLy8gaGV4VG9HXG4gICAgICAgIHZhciBiID0gcGFyc2VJbnQoY29sb3Iuc3Vic3RyaW5nKDQsIDYpLCAxNik7IC8vIGhleFRvQlxuICAgICAgICByZXR1cm4gciAqIDAuMjk5ICsgZyAqIDAuNTg3ICsgYiAqIDAuMTE0ID4gMTg2ID8gXCIjMDAwXCIgOiBcIiNmZmZcIjtcbiAgICB9XG5cbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBpZiAoY29udGV4dCAmJiBjb250ZXh0LnN0YXR1cyA9PT0gXCJhdmFpbGFibGVcIiAmJiBjb250ZXh0Lml0ZW1zLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHNldFNvcnRPcmRlcigpO1xuICAgICAgICAgICAgY2FsY1RvdGFsKCk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIGlmIChjb250ZXh0ICYmIGNvbnRleHQuc3RhdHVzID09PSBcImF2YWlsYWJsZVwiICYmIGNvbnRleHQuaXRlbXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgc2V0Q2FuUmVuZGVyKHRydWUpO1xuICAgICAgICB9XG4gICAgfSwgW2NvbnRleHQsIGNvbG9yc10pO1xuXG4gICAgaWYgKGNhblJlbmRlcikge1xuICAgICAgICBjb25zdCByYWRpdXMgPSAxNS45MTU0OTQzMDkxODk1MjtcbiAgICAgICAgY29uc3QgY2lyY3VtZmVyZW5jZSA9IDIgKiBNYXRoLlBJICogcmFkaXVzO1xuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInNpbXBsZS1kb251dC1jaGFydC13aWRnZXRcIj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImNoYXJ0LWNvbnRhaW5lclwiPlxuICAgICAgICAgICAgICAgICAgICB7ZGlzcGxheVBlcmNlbnRhZ2VzICYmIChcbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZG9udXQtcGVyY2VudGFnZXNcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7Y29udGV4dC5pdGVtcy5tYXAoKGl0ZW0sIGluZGV4KSA9PiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtleT17aXRlbX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImRvbnV0LXBlcmNlbnRhZ2VcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2Zvcm06IGByb3RhdGUoJHtyb3RhdGVQZXJjZW50YWdlKGluZGV4KSB8fCAwfWRlZykgdHJhbnNsYXRlKC01MCUsIC01MCUpYFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2Zvcm06IGByb3RhdGUoLSR7cGVyY2VudGFnZVJvdGF0ZVtpbmRleF0gfHwgMH1kZWcpYCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sb3I6IGNvbG9yc1tpbmRleF1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gZ2V0VGV4dENvbG9yKGNvbG9yc1tpbmRleF0udmFsdWUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IGdldFRleHRDb2xvcihjb2xvckFycmF5W2luZGV4XSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsoZ2V0Q2hhcnROdW1iZXJWYWx1ZShpbmRleCkgLyB0b3RhbCkgKiAxMDAgPj0gNSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBgJHtNYXRoLnJvdW5kKChnZXRDaGFydE51bWJlclZhbHVlKGluZGV4KSAvIHRvdGFsKSAqIDEwMCl9JWB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgICAgIDxzdmdcbiAgICAgICAgICAgICAgICAgICAgICAgIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIlxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiZG9udXRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgdmlld0JveD1cIjAgMCA0MCA0MFwiXG4gICAgICAgICAgICAgICAgICAgICAgICBwcmVzZXJ2ZUFzcGVjdFJhdGlvPVwieE1pbllNaW4gbWVldFwiXG4gICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgIHtjb250ZXh0Lml0ZW1zLm1hcCgoaXRlbSwgaW5kZXgpID0+IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8Y2lyY2xlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtleT17aXRlbX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVmPXtlbGVtZW50ID0+IChjb250YWluZXJSZWYuY3VycmVudFtpbmRleF0gPSBlbGVtZW50KX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZT17YHNpbXBsZWRvbnV0Y2hhcnQtaW5kZXgtJHtpbmRleH1gfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbk1vdXNlRW50ZXI9eygpID0+IHNob3dUb29sdGlwKGluZGV4LCBjb250YWluZXJSZWYuY3VycmVudFtpbmRleF0pfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbk1vdXNlTGVhdmU9eygpID0+IGhpZGVUb29sdGlwKGluZGV4LCBjb250YWluZXJSZWYuY3VycmVudFtpbmRleF0pfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBidXR0b25BY3Rpb24gJiYgb25DbGljayhpbmRleCwgY29udGFpbmVyUmVmLmN1cnJlbnRbaW5kZXhdKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3g9XCIyMFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN5PVwiMjBcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJkb251dC1zbGljZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHI9e3JhZGl1c31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3Ryb2tlV2lkdGg9e3N0cm9rZVdpZHRofVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHJva2U9e2B2YXIoLS1kb251dGNoYXJ0LWNvbG9yLSR7W2luZGV4XX0sICR7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2xvcnNbaW5kZXhdID8gY29sb3JzW2luZGV4XS52YWx1ZSA6IGNvbG9yQXJyYXlbaW5kZXhdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pYH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3Ryb2tlRGFzaGFycmF5PXtjaXJjdW1mZXJlbmNlfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHJva2VEYXNob2Zmc2V0PXtjaXJjdW1mZXJlbmNlIC0gKGNpcmN1bWZlcmVuY2UgKiBnZXRDaGFydE51bWJlclZhbHVlKGluZGV4KSkgLyB0b3RhbH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNmb3JtPXtgcm90YXRlKCR7c2VnbWVudFRvdGFsTGVuZ3RoKGluZGV4LCAtOTApIHx8IDB9IDIwIDIwKWB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGw9XCJub25lXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICAgICAgICAgIDwvc3ZnPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJzaW1wbGUtZG9udXQtY2hhcnQtaW5mb1wiPlxuICAgICAgICAgICAgICAgICAgICB7KGRpc3BsYXlUb3RhbCB8fCBsZWdlbmRUaXRsZSkgJiYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwiZG9udXRjaGFydC10b3RhbCB0ZXh0LWxhcmdlXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge2Rpc3BsYXlUb3RhbCAmJiB1bml0UG9zaXRpb24gPT09IFwiYmVmb3JlXCIgJiYgdW5pdCAmJiB1bml0fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtsZWdlbmRUaXRsZSAmJiBsZWdlbmRUaXRsZS5zdGF0dXMgPT09IFwiYXZhaWxhYmxlXCIgJiYgYCR7bGVnZW5kVGl0bGUudmFsdWV9IGB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge2Rpc3BsYXlUb3RhbCAmJiB0b3RhbH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7ZGlzcGxheVRvdGFsICYmIHVuaXRQb3NpdGlvbiA9PT0gXCJhZnRlclwiICYmIHVuaXQgJiYgdW5pdH1cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICAgICAgICAgICAgKX1cblxuICAgICAgICAgICAgICAgICAgICA8dWwgY2xhc3NOYW1lPVwiZG9udXRjaGFydC1sZWdlbmRcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHtjb250ZXh0Lml0ZW1zLm1hcCgoaXRlbSwgaW5kZXgpID0+IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bGlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAga2V5PXtpdGVtfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lPXtgZG9udXRjaGFydC1sZWdlbmQtaW5kZXgtJHtpbmRleH1gfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbk1vdXNlRW50ZXI9eygpID0+IHNob3dIZ2hsaWdodFBhcnQoY29udGFpbmVyUmVmLmN1cnJlbnRbaW5kZXhdKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25Nb3VzZUxlYXZlPXsoKSA9PiBoaWRlSGlnaGxpZ2h0UGFydChjb250YWluZXJSZWYuY3VycmVudFtpbmRleF0pfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHN2ZyB3aWR0aD1cIjEwXCIgaGVpZ2h0PVwiMTBcIiB2aWV3Qm94PVwiMCAwIDEwIDEwXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8Y2lyY2xlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsbD17YHZhcigtLWRvbnV0Y2hhcnQtY29sb3ItJHtbaW5kZXhdfSwgJHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sb3JzW2luZGV4XSA/IGNvbG9yc1tpbmRleF0udmFsdWUgOiBjb2xvckFycmF5W2luZGV4XVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pYH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjeD1cIjVcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN5PVwiNVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcj1cIjVcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9zdmc+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxwPntjaGFydE5hbWUuZ2V0KGNvbnRleHQuaXRlbXNbaW5kZXhdKS5kaXNwbGF5VmFsdWV9PC9wPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7ZGlzcGxheVZhbHVlcyAmJiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJkb251dGNoYXJ0LXZhbHVlXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge3VuaXRQb3NpdGlvbiA9PT0gXCJiZWZvcmVcIiAmJiB1bml0ICYmIHVuaXR9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge2NoYXJ0VmFsdWUuZ2V0KGNvbnRleHQuaXRlbXNbaW5kZXhdKS5kaXNwbGF5VmFsdWV9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge3VuaXRQb3NpdGlvbiA9PT0gXCJhZnRlclwiICYmIHVuaXQgJiYgdW5pdH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiZG9udXRjaGFydC10b29sdGlwXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlZj17ZWxlbWVudCA9PiAodG9vbHRpcFJlZi5jdXJyZW50W2luZGV4XSA9IGVsZW1lbnQpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8cD57Y2hhcnROYW1lLmdldChjb250ZXh0Lml0ZW1zW2luZGV4XSkuZGlzcGxheVZhbHVlfTwvcD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtkaXNwbGF5VmFsdWVzICYmIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJkb251dGNoYXJ0LXZhbHVlXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHt1bml0UG9zaXRpb24gPT09IFwiYmVmb3JlXCIgJiYgdW5pdCAmJiB1bml0fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7Y2hhcnRWYWx1ZS5nZXQoY29udGV4dC5pdGVtc1tpbmRleF0pLmRpc3BsYXlWYWx1ZX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge3VuaXRQb3NpdGlvbiA9PT0gXCJhZnRlclwiICYmIHVuaXQgJiYgdW5pdH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3A+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2xpPlxuICAgICAgICAgICAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICAgICAgICAgIDwvdWw+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gPGRpdiBjbGFzc05hbWU9XCJkb251dGNoYXJ0LXdpZGdldFwiPjwvZGl2PjtcbiAgICB9XG59XG4iXSwibmFtZXMiOlsiU2ltcGxlRG9udXRDaGFydCIsImJ1dHRvbkFjdGlvbiIsImNvbnRleHQiLCJjaGFydFZhbHVlIiwiY29sb3JzIiwiY3VzdG9tU29ydE9yZGVyIiwiY2hhcnROYW1lIiwiZGlzcGxheVBlcmNlbnRhZ2VzIiwiZGlzcGxheVRvdGFsIiwiZGlzcGxheVZhbHVlcyIsImxlZ2VuZFRpdGxlIiwic29ydEF0dHJpYnV0ZSIsInNvcnRPcmRlciIsInVuaXQiLCJ1bml0UG9zaXRpb24iLCJjYW5SZW5kZXIiLCJzZXRDYW5SZW5kZXIiLCJ1c2VTdGF0ZSIsImNvbnRhaW5lclJlZiIsInVzZVJlZiIsInRvb2x0aXBSZWYiLCJjb2xvckFycmF5IiwidG90YWwiLCJzZXRUb3RhbCIsInN0cm9rZVdpZHRoIiwicGVyY2VudGFnZVJvdGF0ZSIsImN1cnJlbnRJbmRleCIsInByZVNlZ21lbnRzVG90YWxMZW5ndGgiLCJzb3J0SW5zdHJzIiwic2V0VG9vbHRpcFBvc2l0aW9uIiwiZXZlbnQiLCJjdXJzb3JTaXplIiwieCIsIm9mZnNldFgiLCJ5Iiwib2Zmc2V0WSIsImN1cnJlbnQiLCJzdHlsZSIsInNldFByb3BlcnR5IiwiZ2V0Q2hhcnROdW1iZXJWYWx1ZSIsImluZGV4IiwicmF3VmFsdWUiLCJnZXQiLCJpdGVtcyIsImRpc3BsYXlWYWx1ZSIsIk51bWJlciIsInJlcGxhY2UiLCJzaG93SGdobGlnaHRQYXJ0IiwiY3VycmVudENvbnRhaW5lciIsImhpZGVIaWdobGlnaHRQYXJ0Iiwic2hvd1Rvb2x0aXAiLCJjbGFzc0xpc3QiLCJhZGQiLCJkb2N1bWVudCIsImFkZEV2ZW50TGlzdGVuZXIiLCJoaWRlVG9vbHRpcCIsInJlbW92ZSIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJjYWxjVG90YWwiLCJ0b3RhbHMiLCJtYXAiLCJpdGVtIiwicHVzaCIsInJlZHVjZSIsImEiLCJiIiwic2V0U29ydE9yZGVyIiwic29ydGFibGUiLCJpZCIsIm9uQ2xpY2siLCJkb251dEFjdGlvbiIsImNhbkV4ZWN1dGUiLCJleGVjdXRlIiwic2VnbWVudFRvdGFsTGVuZ3RoIiwic3RhcnRBbmdsZSIsInRoaXNUb3RhbCIsInJvdGF0ZVBlcmNlbnRhZ2UiLCJnZXRUZXh0Q29sb3IiLCJiZ0NvbG9yIiwiY29sb3IiLCJjaGFyQXQiLCJzdWJzdHJpbmciLCJyIiwicGFyc2VJbnQiLCJnIiwidXNlRWZmZWN0Iiwic3RhdHVzIiwibGVuZ3RoIiwicmFkaXVzIiwiY2lyY3VtZmVyZW5jZSIsIk1hdGgiLCJQSSIsImNyZWF0ZUVsZW1lbnQiLCJjbGFzc05hbWUiLCJrZXkiLCJ0cmFuc2Zvcm0iLCJ2YWx1ZSIsInJvdW5kIiwieG1sbnMiLCJ2aWV3Qm94IiwicHJlc2VydmVBc3BlY3RSYXRpbyIsInJlZiIsImVsZW1lbnQiLCJuYW1lIiwib25Nb3VzZUVudGVyIiwib25Nb3VzZUxlYXZlIiwiY3giLCJjeSIsInN0cm9rZSIsInN0cm9rZURhc2hhcnJheSIsInN0cm9rZURhc2hvZmZzZXQiLCJmaWxsIiwid2lkdGgiLCJoZWlnaHQiXSwibWFwcGluZ3MiOiI7O0FBR2UsU0FBU0EsZ0JBQWdCQSxDQUFDO0VBQ3JDQyxZQUFZO0VBQ1pDLE9BQU87RUFDUEMsVUFBVTtFQUNWQyxNQUFNO0VBQ05DLGVBQWU7RUFDZkMsU0FBUztFQUNUQyxrQkFBa0I7RUFDbEJDLFlBQVk7RUFDWkMsYUFBYTtFQUNiQyxXQUFXO0VBQ1hDLGFBQWE7RUFDYkMsU0FBUztFQUNUQyxJQUFJO0FBQ0pDLEVBQUFBLFlBQUFBO0FBQ0osQ0FBQyxFQUFFO0VBQ0MsTUFBTSxDQUFDQyxTQUFTLEVBQUVDLFlBQVksQ0FBQyxHQUFHQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUE7QUFDakQsRUFBQSxNQUFNQyxZQUFZLEdBQUdDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQTtBQUMvQixFQUFBLE1BQU1DLFVBQVUsR0FBR0QsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFBO0FBQzdCLEVBQUEsTUFBTUUsVUFBVSxHQUFHLENBQUMsU0FBUyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsU0FBUyxDQUFDLENBQUE7RUFDaEcsTUFBTSxDQUFDQyxLQUFLLEVBQUVDLFFBQVEsQ0FBQyxHQUFHTixRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUE7RUFDckMsTUFBTU8sV0FBVyxHQUFHLENBQUMsQ0FBQTtFQUNyQixNQUFNQyxnQkFBZ0IsR0FBRyxFQUFFLENBQUE7RUFDM0IsSUFBSUMsWUFBWSxHQUFHLENBQUMsQ0FBQTtFQUNwQixJQUFJQyxzQkFBc0IsR0FBRyxDQUFDLENBQUE7RUFDOUIsSUFBSUMsVUFBVSxHQUFHLEVBQUUsQ0FBQTtFQUVuQixTQUFTQyxrQkFBa0JB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
