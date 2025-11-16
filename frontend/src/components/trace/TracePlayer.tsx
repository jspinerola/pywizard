// components/trace/TracePlayer.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import type { TracePayload } from "@/types/trace";
import { buildCodeLines, reconstructState } from "@/lib/trace";
import { TraceControls } from "./TraceControls";
// import { TraceCodeView } from "./TraceCodeView";
import { TraceCallTree } from "./TraceCallTree";
import { TraceLocals } from "./TraceLocals";
// import { TraceStdout } from "./TraceStdout";

interface TracePlayerProps {
  payload: TracePayload | null;
}

const MIN_WAIT_MS = 400;

export default function TracePlayer({ payload }: TracePlayerProps) {
  const trace = payload?.trace ?? [];
  const filename = payload?.filename ?? "<user_code>";
  const code = payload?.code ?? "";

  const lines = useMemo(() => buildCodeLines(code), [code]);
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);
  const codePaneRef = useRef<HTMLDivElement | null>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [selectedFid, setSelectedFid] = useState<number | null>(null);

  const maxStep = Math.max(0, trace.length - 1);
  const state = useMemo(
    () => reconstructState(trace, stepIndex),
    [trace, stepIndex]
  );
  const current = state.lastEvent;

  // reset when new payload arrives
  useEffect(() => {
    setStepIndex(0);
    setPlaying(false);
    setSelectedFid(null);
    lastTsRef.current = null;
    if (codePaneRef.current) codePaneRef.current.scrollTop = 0;
  }, [payload]);

  useEffect(() => {
    if (state.lastEvent) setSelectedFid(state.lastEvent.fid);
  }, [stepIndex, state.lastEvent]);

  // playback loop
  useEffect(() => {
    if (!playing) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastTsRef.current = null;
      return;
    }
    const loop = (nowMs: number) => {
      if (stepIndex >= maxStep) {
        setPlaying(false);
        return;
      }
      const nextEvent = trace[stepIndex + 1];
      const baseMs = (nextEvent?.dt ?? 0) / 1_000_000;
      const waitMs = Math.max(MIN_WAIT_MS, baseMs / Math.max(0.001, speed));

      if (lastTsRef.current == null) lastTsRef.current = nowMs;
      const elapsed = nowMs - lastTsRef.current;
      if (elapsed >= waitMs) {
        setStepIndex((s) => Math.min(maxStep, s + 1));
        lastTsRef.current = nowMs;
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [playing, stepIndex, maxStep, speed, trace]);

  // auto-scroll
  useEffect(() => {
    if (!autoScroll || !state.lastEvent) return;
    const lineNum = state.lastEvent.line;
    const element = document.getElementById(`code-line-${lineNum}`);

    if (element && codePaneRef.current) {
      const parent = codePaneRef.current;
      const elementTopOffset = element.offsetTop;
      if (
        elementTopOffset < parent.scrollTop ||
        elementTopOffset > parent.scrollTop + parent.clientHeight - 60
      ) {
        parent.scrollTo({
          top: Math.max(0, elementTopOffset - parent.clientHeight / 3),
          behavior: "smooth",
        });
      }
    }
  }, [state.lastEvent, autoScroll]);

  if (!payload) {
    return <div>Run code to examine its execution steps.</div>;
  }

  return (
    <div className="space-y-4">
      {/* Controls */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TraceControls
          stepIndex={stepIndex}
          maxStep={maxStep}
          playing={playing}
          speed={speed}
          autoScroll={autoScroll}
          onReset={() => setStepIndex(0)}
          onPrev={() => setStepIndex((s) => Math.max(0, s - 1))}
          onTogglePlay={() => setPlaying((p) => !p)}
          onNext={() => setStepIndex((s) => Math.min(maxStep, s + 1))}
          onEnd={() => setStepIndex(maxStep)}
          onStepChange={setStepIndex}
          onSpeedChange={setSpeed}
          onAutoScrollChange={setAutoScroll}
        />
        {/* Code */}
        {/* <div>
          <TraceCodeView
            filename={filename}
            codeLines={lines}
            currentEvent={current}
            codePaneRef={codePaneRef}
          />
        </div> */}

        {/* Call Tree */}
        <div>
          <TraceCallTree
            state={state}
            selectedFid={selectedFid}
            onSelectFid={setSelectedFid}
          />
        </div>

        {/* Locals */}
        <div>
          <TraceLocals
            state={state}
            selectedFid={selectedFid}
            onSelectFid={setSelectedFid}
          />
        </div>

        {/* Stdout */}
        {/* <div>
          <TraceStdout stdout={state.stdout} />
        </div> */}
      </div>
    </div>
  );
}
