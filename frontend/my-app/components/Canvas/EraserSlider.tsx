import React from 'react'
import { Slider } from "@/components/ui/slider"

type EraserSliderProps = {
  value?: number
  min?: number
  max?: number
  step?: number
  onChange?: (value: number) => void
}

export default function EraserSlider({ value = 20, min = 1, max = 100, step = 1, onChange }: EraserSliderProps) {
  return (
    <div className="mx-auto flex w-full max-w-xs items-center justify-center gap-6">
      <Slider
        value={[value]}
        max={max}
        step={step}
        orientation="vertical"
        className="h-40"
        onValueChange={(v: number | number[]) => {
          const out = Array.isArray(v) ? v[0] : v
          onChange?.(out)
        }}
      />
    </div>
  )
}
