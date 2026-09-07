/* ==========================================================================
   Bali Art Classic Item - Main Application & Chatbot Script
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // --------------------------------------------------------------------------
  // 1. Image Error Fallback Safety
  // --------------------------------------------------------------------------
  document.querySelectorAll('img').forEach((img) => {
    img.addEventListener('error', function () {
      if (!this.dataset.triedFallback) {
        this.dataset.triedFallback = 'true';
        this.src = 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80';
      }
    });
  });

  // --------------------------------------------------------------------------
  // 2. Mobile Navbar Toggle
  // --------------------------------------------------------------------------
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });

    navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
      });
    });
  }

  // --------------------------------------------------------------------------
  // 2. Interactive Art Carousel
  // --------------------------------------------------------------------------
  const slides = document.querySelectorAll('.carousel-slide');
  const dots = document.querySelectorAll('.carousel-dots .dot');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');
  const carouselWrapper = document.querySelector('.hero-carousel-wrapper');

  let currentSlide = 0;
  let carouselInterval = null;

  function showSlide(index) {
    if (slides.length === 0) return;
    
    // Normalize index
    if (index >= slides.length) currentSlide = 0;
    else if (index < 0) currentSlide = slides.length - 1;
    else currentSlide = index;

    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === currentSlide);
    });

    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentSlide);
    });
  }

  function nextSlide() {
    showSlide(currentSlide + 1);
  }

  function prevSlide() {
    showSlide(currentSlide - 1);
  }

  function startCarouselAutoPlay() {
    stopCarouselAutoPlay();
    carouselInterval = setInterval(nextSlide, 4500);
  }

  function stopCarouselAutoPlay() {
    if (carouselInterval) clearInterval(carouselInterval);
  }

  if (slides.length > 0) {
    if (nextBtn) nextBtn.addEventListener('click', () => { nextSlide(); startCarouselAutoPlay(); });
    if (prevBtn) prevBtn.addEventListener('click', () => { prevSlide(); startCarouselAutoPlay(); });

    dots.forEach((dot) => {
      dot.addEventListener('click', (e) => {
        const index = parseInt(e.target.dataset.index, 10);
        showSlide(index);
        startCarouselAutoPlay();
      });
    });

    if (carouselWrapper) {
      carouselWrapper.addEventListener('mouseenter', stopCarouselAutoPlay);
      carouselWrapper.addEventListener('mouseleave', startCarouselAutoPlay);
    }

    startCarouselAutoPlay();
  }

  // --------------------------------------------------------------------------
  // 3. Product Filter Tabs
  // --------------------------------------------------------------------------
  const filterBtns = document.querySelectorAll('.filter-btn');
  const productCards = document.querySelectorAll('.product-card');

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      productCards.forEach((card) => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || filter === category) {
          card.style.display = 'flex';
          card.style.animation = 'fadeIn 0.4s ease';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // --------------------------------------------------------------------------
  // 4. Booking Form Simulation
  // --------------------------------------------------------------------------
  const bookingForm = document.getElementById('booking-form');
  const bookingFeedback = document.getElementById('booking-feedback');

  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('book-name').value.trim();
      const type = document.getElementById('book-type').options[document.getElementById('book-type').selectedIndex].text;

      if (bookingFeedback) {
        bookingFeedback.className = 'booking-feedback success';
        bookingFeedback.innerHTML = `Terima kasih, <strong>${name}</strong>! Permintaan jadwal untuk <strong>${type}</strong> telah kami terima. Tim kurator kami akan menghubungi WhatsApp Anda dalam 1x24 jam.`;
      }
      bookingForm.reset();
    });
  }

  // --------------------------------------------------------------------------
  // 5. Floating Chatbot Widget & API Integration
  // --------------------------------------------------------------------------
  const chatContainer = document.getElementById('floating-chat-container');
  const chatLauncherBtn = document.getElementById('chat-launcher-btn');
  const closeChatBtn = document.getElementById('close-chat-btn');
  const form = document.getElementById('chat-form');
  const input = document.getElementById('user-input');
  const sendBtn = document.getElementById('send-btn');
  const chatBox = document.getElementById('chat-box');
  const clearBtn = document.getElementById('clear-btn');
  const quickChips = document.querySelectorAll('.chip-btn');
  const openChatPrompts = document.querySelectorAll('.open-chat-prompt');

  const API_URL = 'http://localhost:3000/api/chat';
  const STORAGE_KEY = 'bali_art_chat_history';

  // Configure marked for Markdown rendering
  if (typeof marked !== 'undefined') {
    marked.setOptions({
      breaks: true,
      gfm: true,
    });
  }

  // Safe markdown/HTML renderer
  function renderContent(sender, text) {
    if (sender === 'bot' && typeof marked !== 'undefined') {
      const rawHtml = marked.parse(text);
      if (typeof DOMPurify !== 'undefined') {
        return DOMPurify.sanitize(rawHtml);
      }
      return rawHtml;
    }
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Load chat history from localStorage
  let chatHistory = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

  // Toggle Chat Widget Modal
  function toggleChat(open = null) {
    if (!chatContainer) return;
    if (open === true) {
      chatContainer.classList.add('active');
      if (input) input.focus();
    } else if (open === false) {
      chatContainer.classList.remove('active');
    } else {
      chatContainer.classList.toggle('active');
      if (chatContainer.classList.contains('active') && input) {
        input.focus();
      }
    }
  }

  if (chatLauncherBtn) {
    chatLauncherBtn.addEventListener('click', () => toggleChat());
  }

  if (closeChatBtn) {
    closeChatBtn.addEventListener('click', () => toggleChat(false));
  }

  // Trigger Chat from CTA / Product Card Prompts
  openChatPrompts.forEach((btn) => {
    btn.addEventListener('click', () => {
      const prompt = btn.getAttribute('data-prompt');
      toggleChat(true);
      if (prompt && input) {
        input.value = prompt;
        input.focus();
      }
    });
  });

  // Render initial history on page load
  function initChat() {
    if (!chatBox) return;
    chatBox.innerHTML = '';
    if (chatHistory.length === 0) {
      appendMessage(
        'bot',
        'Halo! Selamat datang di **Bali Art Classic Item** 🎨.\n\nSaya adalah asisten AI kurator & mentoring sales. Anda dapat menanyakan seputar **koleksi lukisan, patung, seni 3D print, custom commission**, hingga **jadwal sesi 1-on-1 mentoring** kami. Ada yang bisa kami bantu?',
        false
      );
    } else {
      chatHistory.forEach((msg) => {
        appendMessage(msg.role === 'model' || msg.role === 'bot' ? 'bot' : 'user', msg.text, false);
      });
    }
  }

  // Save history to localStorage
  function saveHistory() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chatHistory));
  }

  // Append message to UI
  function appendMessage(sender, text, isTemporary = false) {
    if (!chatBox) return null;
    const msg = document.createElement('div');
    msg.classList.add('message', sender);
    if (isTemporary) {
      msg.classList.add('loading');
      msg.textContent = text;
    } else {
      msg.innerHTML = renderContent(sender, text);
    }
    chatBox.appendChild(msg);
    chatBox.scrollTop = chatBox.scrollHeight;
    return msg;
  }

  // Send message function
  async function handleSendMessage(customText = null) {
    const userMessage = (customText || (input ? input.value : '')).trim();
    if (!userMessage) return;

    // 1. Append user message to UI & history
    appendMessage('user', userMessage);
    chatHistory.push({ role: 'user', text: userMessage });
    saveHistory();

    if (input) input.value = '';
    if (input) input.disabled = true;
    if (sendBtn) sendBtn.disabled = true;

    // 2. Show loading indicator
    const loadingIndicator = appendMessage('bot', 'AI sedang mengetik respon...', true);

    try {
      // 3. Send conversation history to backend API
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          convertation: chatHistory,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();
      const botReply = data.result || 'Maaf, tidak ada balasan dari server.';

      // Remove loading indicator
      if (loadingIndicator) loadingIndicator.remove();

      // 4. Append bot reply with markdown rendering
      appendMessage('bot', botReply);
      chatHistory.push({ role: 'model', text: botReply });
      saveHistory();
    } catch (error) {
      console.error('Chat error:', error);
      if (loadingIndicator) loadingIndicator.remove();
      appendMessage('bot', `⚠️ **Error**: ${error.message || 'Gagal menghubungi server'}`);
    } finally {
      if (input) {
        input.disabled = false;
        input.focus();
      }
      if (sendBtn) sendBtn.disabled = false;
    }
  }

  // Form submit handler
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      handleSendMessage();
    });
  }

  // Quick suggestion chips handler
  quickChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const promptText = chip.getAttribute('data-text');
      if (promptText) {
        handleSendMessage(promptText);
      }
    });
  });

  // Clear chat button handler
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (confirm('Hapus seluruh riwayat percakapan chat dari penyimpanan?')) {
        chatHistory = [];
        localStorage.removeItem(STORAGE_KEY);
        initChat();
      }
    });
  }

  // Initialize Chat UI
  initChat();
});
