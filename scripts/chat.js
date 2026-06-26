const chat = document.querySelector('.chat');
const chatLog = document.querySelector('#chat-log');
const chatSimulator = document.querySelector('.chat-simulator');
const typingPreview = document.querySelector('#typing-preview');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const conversation = [
  {
    question: 'What should I reorder before the weekend?',
    answer: 'Stock levels for 3 top-selling items are critically low. Recommended reorder: 450 units of Product A and 280 units of Product B before Friday.'
  },
  {
    question: 'Which customers are becoming risky?',
    answer: '7 customers have crossed high-risk credit thresholds this week. Top concern: Customer XYZ with Rs. 4.8L overdue for 21 days.'
  },
  {
    question: 'Summarise today’s performance.',
    answer: 'Today’s performance: Rs. 8.4L total sales across 6 stores. Top performer: Store 3 (+34%). Cash sales are down 12% versus yesterday.'
  }
];

const wait = (duration) => new Promise((resolve) => window.setTimeout(resolve, duration));

function timeNow() {
  return new Intl.DateTimeFormat([], { hour: 'numeric', minute: '2-digit' }).format(new Date());
}

function scrollChat() {
  chatLog.scrollTo({ top: chatLog.scrollHeight, behavior: reduceMotion ? 'auto' : 'smooth' });
}

function createBubble(type, text) {
  const bubble = document.createElement('div');
  bubble.className = `chat-bubble chat-bubble--${type}`;

  const copy = document.createElement('p');
  copy.textContent = text;
  bubble.append(copy);

  const meta = document.createElement('span');
  meta.className = 'chat-meta';
  meta.textContent = `${timeNow()} `;

  if (type === 'sent') {
    const ticks = document.createElement('i');
    ticks.className = 'message-ticks';
    ticks.setAttribute('aria-label', 'Sent');
    ticks.textContent = '✓';
    meta.append(ticks);
  }

  bubble.append(meta);
  chatLog.append(bubble);
  scrollChat();
  return bubble;
}

function updateTicks(bubble, state) {
  const ticks = bubble.querySelector('.message-ticks');
  ticks.textContent = state === 'sent' ? '✓' : '✓✓';
  ticks.classList.toggle('is-read', state === 'read');
  ticks.setAttribute('aria-label', state === 'read' ? 'Read' : 'Delivered');
}

function createTypingIndicator() {
  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble chat-bubble--received chat-bubble--typing';
  bubble.setAttribute('aria-label', 'Volt Intelligence is typing');
  bubble.innerHTML = '<span class="typing-dots" aria-hidden="true"><i></i><i></i><i></i></span>';
  chatLog.append(bubble);
  scrollChat();
  return bubble;
}

async function typeOutgoingMessage(message) {
  typingPreview.textContent = '';
  chatSimulator.classList.add('is-typing');

  if (reduceMotion) {
    typingPreview.textContent = message;
  } else {
    for (const character of message) {
      typingPreview.textContent += character;
      await wait(character === ' ' ? 28 : 42 + Math.random() * 36);
    }
  }

  chatSimulator.classList.remove('is-typing');
  chatSimulator.classList.add('is-ready');
  if (!reduceMotion) await wait(420);
  chatSimulator.classList.add('is-sending');
  if (!reduceMotion) await wait(150);
  typingPreview.textContent = '';
  chatSimulator.classList.remove('is-ready', 'is-sending');
}

async function playConversation() {
  await wait(reduceMotion ? 0 : 500);

  for (const item of conversation) {
    await typeOutgoingMessage(item.question);
    const sent = createBubble('sent', item.question);
    if (!reduceMotion) await wait(380);
    updateTicks(sent, 'delivered');
    if (!reduceMotion) await wait(520);
    updateTicks(sent, 'read');

    const typing = createTypingIndicator();
    if (!reduceMotion) await wait(1100);
    typing.remove();
    createBubble('received', item.answer);
    if (!reduceMotion) await wait(1250);
  }

  chatLog.setAttribute('aria-live', 'off');
}

if (chat && chatLog && chatSimulator && typingPreview) {
  if (reduceMotion || !('IntersectionObserver' in window)) {
    playConversation();
  } else {
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      playConversation();
    }, { threshold: 0.35 });

    observer.observe(chat);
  }
}
