import "./ui/SimpleDonutChart.css";
import { createElement, useEffect, useRef, useState } from "react";

export default function SimpleDonutChart({
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
        const x = event.pageX + cursorSize;
        const y = event.pageY - cursorSize;
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

    function onClick(index) {
        const donutAction = buttonAction.get(context.items[index]);
        if (donutAction && donutAction.canExecute) {
            donutAction.execute();
        }
    }

    function segmentTotalLength(index, startAngle) {
        const thisTotal = (preSegmentsTotalLength * 360) / total + startAngle;
        preSegmentsTotalLength += getChartNumberValue(index);
        return thisTotal;
    }

    function rotatePercentage(index) {
        const thisTotal = segmentTotalLength(index, 0) + (getChartNumberValue(index) * 360) / total / 2;
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

        return (
            <div className="simple-donut-chart-widget">
                <div className="chart-container">
                    {displayPercentages && (
                        <div className="donut-percentages">
                            {context.items.map((item, index) => (
                                <div
                                    key={item}
                                    className="donut-percentage"
                                    style={{
                                        transform: `rotate(${rotatePercentage(index)}deg) translate(-50%, -50%)`
                                    }}
                                >
                                    <span
                                        style={{
                                            transform: `rotate(-${percentageRotate[index]}deg)`,
                                            color: colors[index]
                                                ? getTextColor(colors[index].value)
                                                : getTextColor(colorArray[index])
                                        }}
                                    >
                                        {(getChartNumberValue(index) / total) * 100 >= 5 &&
                                            `${Math.round((getChartNumberValue(index) / total) * 100)}%`}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
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
                                onClick={() => buttonAction && onClick(index)}
                                cx="20"
                                cy="20"
                                className="donut-slice"
                                r={radius}
                                strokeWidth={strokeWidth}
                                stroke={`var(--donutchart-color-${[index]}, ${
                                    colors[index] ? colors[index].value : colorArray[index]
                                })`}
                                strokeDasharray={circumference}
                                strokeDashoffset={circumference - (circumference * getChartNumberValue(index)) / total}
                                transform={`rotate(${segmentTotalLength(index, -90)} 20 20)`}
                                fill="none"
                            />
                        ))}
                    </svg>
                </div>

                <div className="simple-donut-chart-info">
                    {(displayTotal || legendTitle) && (
                        <p className="donutchart-total text-large">
                            {displayTotal && unitPosition === "before" && unit && unit}
                            {legendTitle && legendTitle.status === "available" && `${legendTitle.value} `}
                            {displayTotal && total}
                            {displayTotal && unitPosition === "after" && unit && unit}
                        </p>
                    )}

                    <ul className={`donutchart-legend`}>
                        {context.items.map((item, index) => (
                            <li
                                key={item}
                                name={`donutchart-legend-index-${index}`}
                                onMouseEnter={() => showHghlightPart(containerRef.current[index])}
                                onMouseLeave={() => hideHighlightPart(containerRef.current[index])}
                            >
                                <span
                                    style={{
                                        backgroundColor: `var(--donutchart-color-${[index]}, ${
                                            colors[index] ? colors[index].value : colorArray[index]
                                        })`
                                    }}
                                ></span>
                                <p>{chartName.get(context.items[index]).displayValue}</p>
                                {displayValues && (
                                    <p className="donutchart-value">
                                        {unitPosition === "before" && unit && unit}
                                        {chartValue.get(context.items[index]).displayValue}
                                        {unitPosition === "after" && unit && unit}
                                    </p>
                                )}
                                <div
                                    className="donutchart-tooltip"
                                    ref={element => (tooltipRef.current[index] = element)}
                                >
                                    <p>{chartName.get(context.items[index]).displayValue}</p>
                                    {displayValues && (
                                        <p className="donutchart-value">
                                            {unitPosition === "before" && unit && unit}
                                            {chartValue.get(context.items[index]).displayValue}
                                            {unitPosition === "after" && unit && unit}
                                        </p>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        );
    } else {
        return <div className="donutchart-widget"></div>;
    }
}
