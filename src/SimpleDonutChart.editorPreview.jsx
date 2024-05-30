import { createElement } from "react";

export function preview({ colors, displayTotal, displayValues, legendTitle, unit, unitPosition }) {
    const colorArray = ["#003f5c", "#665191", "#a05195", "#d45087", "#f95d6a", "#ff7c43", "#ffa600"];
    const radius = 15.91549430918952;
    const circumference = 2 * Math.PI * radius;
    const total = 100;
    let preSegmentsTotalLength = 0;

    function segmentTotalLength(value) {
        const thisTotal = (preSegmentsTotalLength * 360) / total + -90;
        preSegmentsTotalLength += value;
        return thisTotal;
    }

    return (
        <div className="simple-donut-chart-widget">
            <div className="chart-container">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="donut"
                    viewBox="0 0 40 40"
                    preserveAspectRatio="xMinYMin meet"
                >
                    <circle
                        name="simpledonutchart-index-1"
                        cx="20"
                        cy="20"
                        className="donut-slice"
                        r={radius}
                        strokeWidth={4}
                        stroke={`var(--donutchart-color-1, ${colors[0] ? colors[0].value : colorArray[0]})`}
                        strokeDasharray={circumference}
                        strokeDashoffset={circumference - (circumference * 25) / total}
                        transform={`rotate(${segmentTotalLength(25, -90) || 0} 20 20)`}
                        fill="none"
                    />

                    <circle
                        name="simpledonutchart-index-2"
                        cx="20"
                        cy="20"
                        className="donut-slice"
                        r={radius}
                        strokeWidth={4}
                        stroke={`var(--donutchart-color-2, ${colors[1] ? colors[1].value : colorArray[1]})`}
                        strokeDasharray={circumference}
                        strokeDashoffset={circumference - (circumference * 25) / total}
                        transform={`rotate(${segmentTotalLength(25, -90) || 0} 20 20)`}
                        fill="none"
                    />

                    <circle
                        name="simpledonutchart-index-3"
                        cx="20"
                        cy="20"
                        className="donut-slice"
                        r={radius}
                        strokeWidth={4}
                        stroke={`var(--donutchart-color-3, ${colors[2] ? colors[2].value : colorArray[2]})`}
                        strokeDasharray={circumference}
                        strokeDashoffset={circumference - (circumference * 50) / total}
                        transform={`rotate(${segmentTotalLength(50, -90) || 0} 20 20)`}
                        fill="none"
                    />
                </svg>
            </div>

            <div className="simple-donut-chart-info">
                {(displayTotal || legendTitle) && (
                    <p className="donutchart-total text-large">
                        {displayTotal && unitPosition === "before" && unit && unit}
                        {legendTitle && legendTitle}
                        {displayTotal && total}
                        {displayTotal && unitPosition === "after" && unit && unit}
                    </p>
                )}

                <ul className="donutchart-legend">
                    <li name="donutchart-legend-index-1">
                        <svg width="10" height="10" viewBox="0 0 10 10">
                            <circle
                                fill={`var(--donutchart-color-1}, ${colors[0] ? colors[0].value : colorArray[0]})`}
                                cx="5"
                                cy="5"
                                r="5"
                            />
                        </svg>
                        <p>Item 1</p>
                        {displayValues && (
                            <p className="donutchart-value">
                                {unitPosition === "before" && unit && unit}
                                25
                                {unitPosition === "after" && unit && unit}
                            </p>
                        )}
                    </li>

                    <li name="donutchart-legend-index-2">
                        <svg width="10" height="10" viewBox="0 0 10 10">
                            <circle
                                fill={`var(--donutchart-color-2}, ${colors[1] ? colors[1].value : colorArray[1]})`}
                                cx="5"
                                cy="5"
                                r="5"
                            />
                        </svg>
                        <p>Item 2</p>
                        {displayValues && (
                            <p className="donutchart-value">
                                {unitPosition === "before" && unit && unit}
                                25
                                {unitPosition === "after" && unit && unit}
                            </p>
                        )}
                    </li>

                    <li name="donutchart-legend-index-3">
                        <svg width="10" height="10" viewBox="0 0 10 10">
                            <circle
                                fill={`var(--donutchart-color-3}, ${colors[2] ? colors[2].value : colorArray[2]})`}
                                cx="5"
                                cy="5"
                                r="5"
                            />
                        </svg>
                        <p>Item 3</p>
                        {displayValues && (
                            <p className="donutchart-value">
                                {unitPosition === "before" && unit && unit}
                                50
                                {unitPosition === "after" && unit && unit}
                            </p>
                        )}
                    </li>
                </ul>
            </div>
        </div>
    );
}

export function getPreviewCss() {
    return require("./ui/SimpleDonutChart.css");
}
