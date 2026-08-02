// Web Audio API Synthesizer for reliable notification chime
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playNotificationChime() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Pleasant 3-note ascending chime (C5 -> E5 -> G5)
    const notes = [523.25, 659.25, 783.99]; 
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);

      gain.gain.setValueAtTime(0.01, now + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.25, now + idx * 0.12 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 0.35);
    });

    // Vibrate device if supported
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([200, 100, 200, 100, 300]);
    }
  } catch (err) {
    console.warn('Could not play notification sound:', err);
  }
}

export function getNotificationPermissionStatus(): NotificationPermission | 'unsupported' {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (err) {
    console.error('Error requesting notification permission:', err);
    return getNotificationPermissionStatus();
  }
}

export function triggerSystemNotification(title: string, options?: NotificationOptions, playSound = true) {
  if (playSound) {
    playNotificationChime();
  }

  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      const notification = new Notification(title, {
        icon: 'https://codeforces.org/s/0/favicon.png',
        badge: 'https://codeforces.org/s/0/favicon.png',
        requireInteraction: true,
        ...options,
      });

      notification.onclick = () => {
        window.focus();
        if (options?.data?.url) {
          window.open(options.data.url, '_blank');
        }
        notification.close();
      };
    } catch (err) {
      console.warn('Failed to dispatch native Notification:', err);
    }
  }
}

export function sendTestNotification(playSound = true) {
  triggerSystemNotification('🚨 Codeforces Contest Reminder Test', {
    body: 'Test notification working! You will be notified 20 minutes before Codeforces contests start.',
    tag: 'cf-test-notification',
    data: { url: 'https://codeforces.com/contests' }
  }, playSound);
}
