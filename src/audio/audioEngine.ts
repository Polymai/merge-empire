let audioContext: AudioContext | null = null;
let ambient: OscillatorNode | null = null;

function getContext() {
  if (audioContext) return audioContext;
  audioContext = new AudioContext();
  return audioContext;
}

function tone(frequency: number, duration: number, gainValue: number) {
  const context = getContext();
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = "sine";
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(0, context.currentTime);
  gain.gain.linearRampToValueAtTime(gainValue, context.currentTime + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + duration);
  oscillator.connect(gain).connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + duration);
}

export function playClick(muted: boolean) {
  if (muted) return;
  tone(260, 0.08, 0.025);
}

export function playMerge(muted: boolean) {
  if (muted) return;
  tone(420, 0.1, 0.04);
  window.setTimeout(() => tone(680, 0.13, 0.035), 70);
}

export function playReward(muted: boolean) {
  if (muted) return;
  tone(520, 0.1, 0.035);
  window.setTimeout(() => tone(760, 0.16, 0.035), 80);
}

export function startAmbient(muted: boolean) {
  if (muted || ambient) return;
  const context = getContext();
  ambient = context.createOscillator();
  const gain = context.createGain();
  ambient.type = "triangle";
  ambient.frequency.value = 72;
  gain.gain.value = 0.008;
  ambient.connect(gain).connect(context.destination);
  ambient.start();
}

export function stopAmbient() {
  if (!ambient) return;
  ambient.stop();
  ambient = null;
}
