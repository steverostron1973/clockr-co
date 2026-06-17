import { useCallback, useEffect, useRef, useState } from 'react';

const DEFAULT_SETTINGS = {
	workMinutes: 25,
	shortBreakMinutes: 5,
	longBreakMinutes: 15,
	sessionsBeforeLongBreak: 4,
};

const PHASE_LABELS = {
	work: 'Focus Time',
	shortBreak: 'Short Break',
	longBreak: 'Long Break',
};

function formatTime(totalSeconds) {
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = totalSeconds % 60;
	return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function getPhaseDuration(phase, settings) {
	if (phase === 'work') return settings.workMinutes * 60;
	if (phase === 'shortBreak') return settings.shortBreakMinutes * 60;
	return settings.longBreakMinutes * 60;
}

function clampSetting(value, min, max) {
	const n = parseInt(value, 10);
	if (isNaN(n)) return min;
	return Math.min(max, Math.max(min, n));
}

async function playChime(audioCtxRef) {
	try {
		if (!audioCtxRef.current) {
			audioCtxRef.current = new AudioContext();
		}
		const ctx = audioCtxRef.current;
		if (ctx.state === 'suspended') await ctx.resume();

		const t0 = ctx.currentTime;
		const osc = ctx.createOscillator();
		const gain = ctx.createGain();

		osc.type = 'sine';
		osc.frequency.setValueAtTime(880, t0);
		osc.frequency.exponentialRampToValueAtTime(660, t0 + 0.15);

		gain.gain.setValueAtTime(0.0001, t0);
		gain.gain.exponentialRampToValueAtTime(0.25, t0 + 0.02);
		gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.35);

		osc.connect(gain);
		gain.connect(ctx.destination);
		osc.start(t0);
		osc.stop(t0 + 0.4);
	} catch {
		/* audio unavailable */
	}
}

export default function PomodoroTimer() {
	const [settings, setSettings] = useState(DEFAULT_SETTINGS);
	const [phase, setPhase] = useState('work');
	const [workSession, setWorkSession] = useState(1);
	const [remainingSeconds, setRemainingSeconds] = useState(
		DEFAULT_SETTINGS.workMinutes * 60,
	);
	const [isRunning, setIsRunning] = useState(false);
	const [isFlashing, setIsFlashing] = useState(false);
	const [settingsOpen, setSettingsOpen] = useState(false);

	const endTimeRef = useRef(null);
	const intervalRef = useRef(null);
	const audioCtxRef = useRef(null);
	const completingRef = useRef(false);
	const phaseRef = useRef(phase);
	const workSessionRef = useRef(workSession);
	const settingsRef = useRef(settings);
	const isRunningRef = useRef(isRunning);

	phaseRef.current = phase;
	workSessionRef.current = workSession;
	settingsRef.current = settings;
	isRunningRef.current = isRunning;

	const clearTimer = useCallback(() => {
		if (intervalRef.current) {
			clearInterval(intervalRef.current);
			intervalRef.current = null;
		}
		endTimeRef.current = null;
	}, []);

	const getRemainingFromEnd = useCallback(() => {
		if (endTimeRef.current == null) return 0;
		return Math.max(0, Math.ceil((endTimeRef.current - performance.now()) / 1000));
	}, []);

	const advancePhase = useCallback(() => {
		const currentPhase = phaseRef.current;
		const session = workSessionRef.current;
		const cfg = settingsRef.current;
		let nextPhase = 'work';
		let nextSession = session;

		if (currentPhase === 'work') {
			if (session >= cfg.sessionsBeforeLongBreak) {
				nextPhase = 'longBreak';
			} else {
				nextPhase = 'shortBreak';
			}
		} else if (currentPhase === 'shortBreak') {
			nextSession = session + 1;
			nextPhase = 'work';
		} else {
			nextSession = 1;
			nextPhase = 'work';
		}

		const duration = getPhaseDuration(nextPhase, cfg);
		setPhase(nextPhase);
		setWorkSession(nextSession);
		setRemainingSeconds(duration);

		if (isRunningRef.current) {
			endTimeRef.current = performance.now() + duration * 1000;
		}

		return duration;
	}, []);

	const handlePhaseComplete = useCallback(async () => {
		await playChime(audioCtxRef);
		setIsFlashing(true);
		setTimeout(() => setIsFlashing(false), 600);
		advancePhase();
	}, [advancePhase]);

	const tick = useCallback(() => {
		const remaining = getRemainingFromEnd();
		setRemainingSeconds(remaining);
		if (remaining <= 0 && !completingRef.current) {
			completingRef.current = true;
			handlePhaseComplete().finally(() => {
				completingRef.current = false;
			});
		}
	}, [getRemainingFromEnd, handlePhaseComplete]);

	useEffect(() => {
		if (!isRunning) {
			clearTimer();
			return undefined;
		}

		tick();
		intervalRef.current = setInterval(tick, 100);

		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
				intervalRef.current = null;
			}
		};
	}, [isRunning, tick, clearTimer]);

	const handleStartPause = () => {
		if (isRunning) {
			const remaining = getRemainingFromEnd();
			setRemainingSeconds(remaining);
			setIsRunning(false);
			return;
		}

		endTimeRef.current = performance.now() + remainingSeconds * 1000;
		setIsRunning(true);
	};

	const handleReset = () => {
		clearTimer();
		setIsRunning(false);
		setPhase('work');
		setWorkSession(1);
		setRemainingSeconds(settings.workMinutes * 60);
		setIsFlashing(false);
	};

	const updateSetting = (key, rawValue) => {
		const limits = {
			workMinutes: [1, 120],
			shortBreakMinutes: [1, 30],
			longBreakMinutes: [1, 60],
			sessionsBeforeLongBreak: [1, 10],
		};
		const [min, max] = limits[key];
		const digits = String(rawValue).replace(/\D/g, '');
		const clamped = digits === '' ? min : clampSetting(digits, min, max);
		const next = { ...settings, [key]: clamped };

		setSettings(next);

		if (!isRunning) {
			const duration = getPhaseDuration(phase, next);
			if (phase === 'work' && workSession > next.sessionsBeforeLongBreak) {
				setWorkSession(1);
			}
			setRemainingSeconds(duration);
		}
	};

	const sessionsTotal = settings.sessionsBeforeLongBreak;
	const phaseLabel = PHASE_LABELS[phase];

	const dots = Array.from({ length: sessionsTotal }, (_, i) => {
		const index = i + 1;
		let state = 'empty';
		if (phase === 'longBreak') {
			state = 'complete';
		} else if (phase === 'work' && index < workSession) {
			state = 'complete';
		} else if (phase === 'work' && index === workSession) {
			state = 'active';
		} else if (phase === 'shortBreak' && index <= workSession) {
			state = 'complete';
		}
		return state;
	});

	const sessionLabel =
		phase === 'longBreak'
			? `Cycle complete — long break`
			: `Session ${workSession} of ${sessionsTotal}`;

	return (
		<div className="pomo-tool">
			<div className={`pomo-display-card${isFlashing ? ' pomo-display-card--flash' : ''}`}>
				<div className={`pomo-phase-label pomo-phase-label--${phase}`}>{phaseLabel}</div>
				<div className="pomo-display">{formatTime(remainingSeconds)}</div>
			</div>

			<div className="pomo-session">
				<p className="pomo-session-label">{sessionLabel}</p>
				<div className="pomo-dots" aria-hidden="true">
					{dots.map((state, i) => (
						<span key={i} className={`pomo-dot pomo-dot--${state}`} />
					))}
				</div>
			</div>

			<div className="pomo-controls">
				<button
					type="button"
					className="pomo-control-btn pomo-control-primary"
					onClick={handleStartPause}
				>
					{isRunning ? 'Pause' : 'Start'}
				</button>
				<button type="button" className="pomo-control-btn" onClick={handleReset}>
					Reset
				</button>
			</div>

			<div className="pomo-settings">
				<button
					type="button"
					className={`pomo-settings-toggle${settingsOpen ? ' pomo-settings-toggle--open' : ''}`}
					onClick={() => setSettingsOpen((open) => !open)}
					aria-expanded={settingsOpen}
					aria-controls="pomo-settings-panel"
				>
					<span className="pomo-settings-icon" aria-hidden="true">
						⚙
					</span>
					Settings
				</button>

				{settingsOpen && (
					<div className="pomo-settings-panel" id="pomo-settings-panel">
						<h3 className="pomo-settings-title">Timer settings</h3>
						<div className="pomo-settings-grid">
							<div className="pomo-setting">
								<label className="pomo-label" htmlFor="pomo-work">
									Work duration (minutes)
								</label>
								<input
									id="pomo-work"
									type="text"
									inputMode="numeric"
									className="pomo-input"
									value={String(settings.workMinutes)}
									onChange={(e) => updateSetting('workMinutes', e.target.value)}
									onFocus={(e) => e.target.select()}
									disabled={isRunning}
								/>
							</div>
							<div className="pomo-setting">
								<label className="pomo-label" htmlFor="pomo-short">
									Short break (minutes)
								</label>
								<input
									id="pomo-short"
									type="text"
									inputMode="numeric"
									className="pomo-input"
									value={String(settings.shortBreakMinutes)}
									onChange={(e) => updateSetting('shortBreakMinutes', e.target.value)}
									onFocus={(e) => e.target.select()}
									disabled={isRunning}
								/>
							</div>
							<div className="pomo-setting">
								<label className="pomo-label" htmlFor="pomo-long">
									Long break (minutes)
								</label>
								<input
									id="pomo-long"
									type="text"
									inputMode="numeric"
									className="pomo-input"
									value={String(settings.longBreakMinutes)}
									onChange={(e) => updateSetting('longBreakMinutes', e.target.value)}
									onFocus={(e) => e.target.select()}
									disabled={isRunning}
								/>
							</div>
							<div className="pomo-setting">
								<label className="pomo-label" htmlFor="pomo-sessions">
									Sessions before long break
								</label>
								<input
									id="pomo-sessions"
									type="text"
									inputMode="numeric"
									className="pomo-input"
									value={String(settings.sessionsBeforeLongBreak)}
									onChange={(e) =>
										updateSetting('sessionsBeforeLongBreak', e.target.value)
									}
									onFocus={(e) => e.target.select()}
									disabled={isRunning}
								/>
							</div>
						</div>
						{isRunning && (
							<p className="pomo-settings-note">
								Pause or reset the timer to change settings.
							</p>
						)}
					</div>
				)}
			</div>
		</div>
	);
}
