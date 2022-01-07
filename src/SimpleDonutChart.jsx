import "./ui/SimpleDonutChart.css";
import { createElement, useEffect, useRef, useState } from "react";

export default function SimpleDonutChart({
    context,
    chartValue,
    colors,
    customSortOrder,
    chartName,
    displayTotal,
    sortAttribute,
    sortOrder,
    unit,
    unitPosition
}) {
    const [canRender, setCanRender] = useState(false);
    const containerRef = useRef([]);
    const tooltipRef = useRef([]);
    const colorArray = ["#003f5c", "#2f4b7c", "#665191", "#a05195", "#d45087", "#f95d6a", "#ff7c43", "#ffa600"];
    const [total, setTotal] = useState(0);
    const strokeWidth = 4;
    let currentIndex = 0;
    let preSegmentsTotalLength = 0;
    let sortInstrs = [];

    function setTooltipPosition(event) {
        const cursorSize = 32 / 2;
        const x = event.pageX + cursorSize;
        const y = event.pageY - cursorSize;
        tooltipRef.current[currentIndex].style.setProperty("--x", `${x}px`);
        tooltipRef.current[currentIndex].style.setProperty("--y", `${y}px`);
    }

    function showHghlightPart(currentContainer) {
        currentContainer.style.strokeWidth = strokeWidth + 2;
    }

    function hideHighlightPart(currentContainer) {
        currentContainer.style.strokeWidth = null;
    }

    function showTooltip(index, currentContainer) {
        tooltipRef.current[index].classList.add("show-tooltip");
        currentIndex = index;
        showHghlightPart(currentContainer);
        document.addEventListener("mousemove", setTooltipPosition);
    }

    function hideTooltip(index, currentContainer) {
        tooltipRef.current[index].classList.remove("show-tooltip");
        currentIndex = 0;
        hideHighlightPart(currentContainer);
        document.removeEventListener("mousemove", setTooltipPosition);
    }

    function calcTotal() {
        const totals = [];
        context.items.map((item, index) => totals.push(Number(chartValue.get(context.items[index]).displayValue)));
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

    useEffect(() => {
        if (context && context.status === "available" && context.items.length > 0) {
            setSortOrder();
            calcTotal();
            setCanRender(true);
        }
    }, [context, colors]);

    if (canRender) {
        const radius = 15.91549430918952;
        const circumference = 2 * Math.PI * radius;
        const startAngle = -90;

        function segmentTotalLength(index) {
            const thisTotal = (preSegmentsTotalLength * 360) / total + startAngle;
            preSegmentsTotalLength += Number(Math.round(chartValue.get(context.items[index]).displayValue));
            return thisTotal;
        }

        return (
            <div className="simple-donut-chart-widget">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="donut"
                    viewBox="0 0 40 40"
                    preserveAspectRatio="xMinYMin meet"
                >
                    {context.items.map((item, index) => (
                        <circle
                            key={item}
                            ref={element => (containerRef.current[index] = element)}
                            name={`simpledonutchart-index-${index}`}
                            onMouseEnter={() => showTooltip(index, containerRef.current[index])}
                            onMouseLeave={() => hideTooltip(index, containerRef.current[index])}
                            cx="20"
                            cy="20"
                            class="donut-slice"
                            r={radius}
                            stroke-width={strokeWidth}
                            stroke={`var(--linechart-color-${[index]}, ${
                                colors[index] ? colors[index].value : colorArray[index]
                            })`}
                            strokeDasharray={Math.round(circumference)}
                            strokeDashoffset={Math.round(
                                circumference -
                                    (circumference * chartValue.get(context.items[index]).displayValue) / total
                            )}
                            transform={`rotate(${segmentTotalLength(index)} 20 20)`}
                            fill="none"
                        />
                    ))}
                </svg>

                <div className="simple-donut-chart-info">
                    {displayTotal && (
                        <h1 className="linechart-total">
                            {unitPosition === "before" && unit && unit}
                            {total}
                            {unitPosition === "after" && unit && unit}
                        </h1>
                    )}

                    <ul className={`linechart-legend`}>
                        {context.items.map((item, index) => (
                            <li
                                key={item}
                                name={`linechart-legend-index-${index}`}
                                onMouseEnter={() => showHghlightPart(containerRef.current[index])}
                                onMouseLeave={() => hideHighlightPart(containerRef.current[index])}
                            >
                                <span
                                    style={{
                                        backgroundColor: `var(--linechart-color-${[index]}, ${
                                            colors[index] ? colors[index].value : colorArray[index]
                                        })`
                                    }}
                                ></span>
                                <p>{chartName.get(context.items[index]).displayValue}</p>
                                <p>
                                    {unitPosition === "before" && unit && unit}
                                    {chartValue.get(context.items[index]).displayValue}
                                    {unitPosition === "after" && unit && unit}
                                </p>
                                <div
                                    className="linechart-tooltip"
                                    ref={element => (tooltipRef.current[index] = element)}
                                >
                                    <p>{chartName.get(context.items[index]).displayValue}</p>
                                    <p>
                                        {unitPosition === "before" && unit && unit}
                                        {chartValue.get(context.items[index]).displayValue}
                                        {unitPosition === "after" && unit && unit}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        );
    } else {
        return <div className="linechart-widget"></div>;
    }
}
