import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"
import { cn } from "../../lib/utils"

const Slider = React.forwardRef(({ 
  className, 
  defaultValue,
  min = 0,
  max = 100,
  step = 1,
  formatLabel,
  showTooltip = true,
  showTicks = false,
  tickValues = [],
  orientation = "horizontal",
  ...props 
}, ref) => {
  const [hoveredThumb, setHoveredThumb] = React.useState(null);
  const [dragging, setDragging] = React.useState(false);

  const formatValue = (value) => {
    if (formatLabel) {
      return formatLabel(value)
    }
    return value
  }

  return (
    <div className="relative">
      <SliderPrimitive.Root
        ref={ref}
        className={cn(
          "relative flex w-full touch-none select-none items-center",
          orientation === "vertical" && "h-full flex-col",
          className
        )}
        onPointerDown={() => setDragging(true)}
        onPointerUp={() => setDragging(false)}
        {...props}
      >
        <SliderPrimitive.Track
          className={cn(
            "relative h-2 w-full grow overflow-hidden rounded-full bg-secondary",
            orientation === "vertical" && "h-full w-2"
          )}
        >
          <SliderPrimitive.Range className="absolute h-full bg-primary" />
        </SliderPrimitive.Track>

        {props.value?.map((value, index) => (
          <SliderPrimitive.Thumb
            key={index}
            className={cn(
              "block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
              (dragging || hoveredThumb === index) && "border-primary/50"
            )}
            onMouseEnter={() => setHoveredThumb(index)}
            onMouseLeave={() => setHoveredThumb(null)}
          >
            {showTooltip && (hoveredThumb === index || dragging) && (
              <div
                className={cn(
                  "absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full",
                  "px-2 py-1 rounded bg-primary text-primary-foreground text-xs",
                  "opacity-0 transition-opacity",
                  (hoveredThumb === index || dragging) && "opacity-100"
                )}
              >
                {formatValue(value)}
              </div>
            )}
          </SliderPrimitive.Thumb>
        ))}

        {showTicks && (
          <div
            className={cn(
              "absolute left-0 right-0 flex justify-between",
              orientation === "vertical" ? "-left-6" : "-bottom-6"
            )}
          >
            {(tickValues.length > 0 ? tickValues : [min, max]).map((tick) => (
              <div
                key={tick}
                className="flex flex-col items-center"
              >
                <div className="h-1 w-0.5 bg-border" />
                <span className="mt-1 text-xs text-muted-foreground">
                  {formatValue(tick)}
                </span>
              </div>
            ))}
          </div>
        )}
      </SliderPrimitive.Root>
    </div>
  )
})

Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }