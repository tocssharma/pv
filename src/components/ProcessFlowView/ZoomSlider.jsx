"use client";
 
import React, { useCallback } from "react";
import { Maximize, Minus, Plus } from "lucide-react";
import { Panel } from "@xyflow/react";
import { Slider } from "../../components/ui/slider";
import { Button } from "../../components/ui/button";
import { cn } from "../../lib/utils";

// Import these from ReactFlow instead of @xyflow/react
import { useReactFlow, useStoreApi } from 'reactflow';
 
const ZoomSlider = React.forwardRef((props, ref) => {
  const { className, ...restProps } = props;
  
  const store = useStoreApi();
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  // Get zoom level from the store
  const zoom = store.getState().transform[2];
  const minZoom = store.getState().minZoom;
  const maxZoom = store.getState().maxZoom;

  // Custom zoom to function
  const setZoom = useCallback((zoomLevel) => {
    store.setState({
      transform: [...store.getState().transform.slice(0, 2), zoomLevel]
    });
  }, [store]);
 
  return (
    <Panel
      ref={ref}
      className={cn("flex bg-primary-foreground text-foreground", className)}
      {...restProps}
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={() => zoomOut({ duration: 300 })}
      >
        <Minus className="h-4 w-4" />
      </Button>

      <Slider
        className="w-[140px]"
        value={[zoom]}
        min={minZoom}
        max={maxZoom}
        step={0.01}
        onValueChange={(values) => setZoom(values[0])}
      />

      <Button
        variant="ghost"
        size="icon"
        onClick={() => zoomIn({ duration: 300 })}
      >
        <Plus className="h-4 w-4" />
      </Button>

      <Button
        className="min-w-20 tabular-nums"
        variant="ghost"
        onClick={() => setZoom(1)}
      >
        {(100 * zoom).toFixed(0)}%
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => fitView({ duration: 300 })}
      >
        <Maximize className="h-4 w-4" />
      </Button>
    </Panel>
  );
});
 
ZoomSlider.displayName = "ZoomSlider";

export { ZoomSlider };