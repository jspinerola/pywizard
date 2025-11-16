import {
  ChevronLast,
  Pause,
  Play,
  RotateCcw,
  SkipBack,
  SkipForward,
} from "lucide-react";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { Slider } from "../ui/slider";
import { TracePanel } from "./TracePanel";

interface TraceControlsProps {
  stepIndex: number;
  maxStep: number;
  playing: boolean;
  speed: number;
  autoScroll: boolean;
  onReset: () => void;
  onPrev: () => void;
  onTogglePlay: () => void;
  onNext: () => void;
  onEnd: () => void;
  onStepChange: (step: number) => void;
  onSpeedChange: (speed: number) => void;
  onAutoScrollChange: (value: boolean) => void;
}

export function TraceControls({
  stepIndex,
  maxStep,
  playing,
  speed,
  autoScroll,
  onReset,
  onPrev,
  onTogglePlay,
  onNext,
  onEnd,
  onStepChange,
  onSpeedChange,
  onAutoScrollChange,
}: TraceControlsProps) {
  return (
    <TracePanel title="Trace Controls">
      <div className="flex flex-col justify-between h-full gap-4">
        <div className="mt-4 flex items-center gap-4 flex-wrap">
          <Label htmlFor="step-slider" className="mb-1">
            Step {stepIndex}
          </Label>
          <Slider
            id="step-slider"
            min={0}
            max={maxStep}
            value={[stepIndex]}
            onValueChange={(vals: number[]) => onStepChange(vals[0] ?? 0)}
            className="w-full"
          />
          {/* <div className="flex items-center gap-2">
          <span>Step: {stepIndex}</span>
          <span>Speed: {speed}</span>
        </div> */}
          <div className="flex items-center gap-2 flex-wrap justify-evenly w-full">
            <Button
              onClick={onReset}
              disabled={stepIndex === 0}
              aria-label="Reset to first step"
              title="Reset to first step"
            >
              <RotateCcw aria-hidden="true" />
            </Button>
            <Button
              onClick={onPrev}
              disabled={stepIndex === 0}
              aria-label="Previous step"
              title="Previous step"
            >
              <SkipBack aria-hidden="true" />
            </Button>
            <Button
              onClick={onTogglePlay}
              aria-label={playing ? "Pause playback" : "Play trace"}
              title={playing ? "Pause playback" : "Play trace"}
            >
              {playing ? (
                <Pause aria-hidden="true" />
              ) : (
                <Play aria-hidden="true" />
              )}
            </Button>
            <Button
              onClick={onNext}
              disabled={stepIndex >= maxStep - 1}
              aria-label="Next step"
              title="Next step"
            >
              <SkipForward aria-hidden="true" />
            </Button>
            <Button
              onClick={onEnd}
              disabled={stepIndex >= maxStep - 1}
              aria-label="Go to last step"
              title="Go to last step"
            >
              <ChevronLast aria-hidden="true" />
            </Button>
          </div>

          {/* <div className="flex items-center gap-2">
          <Checkbox
            id="auto-scroll"
            checked={autoScroll}
            onCheckedChange={(checked) => onAutoScrollChange(!!checked)}
          />
          <Label htmlFor="auto-scroll">Auto Scroll</Label>
        </div> */}
        </div>
        <div className="flex flex-col w-full mt-4">
          <Label htmlFor="speed-slider" className="mb-1">
            Speed: {speed}x
          </Label>
          <Slider
            id="speed-slider"
            min={0.25}
            max={4}
            step={0.25}
            value={[speed]}
            onValueChange={(vals: number[]) => onSpeedChange(vals[0] ?? 1)}
            className="w-full"
          />
        </div>
      </div>
    </TracePanel>
  );
}
