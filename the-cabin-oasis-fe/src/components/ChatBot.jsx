import React, { useState, useEffect, useRef } from 'react';

const API_BASE = 'http://localhost:3000/api';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [mode, setMode] = useState('idle'); // idle | booking_helper | booking_lookup | collect_contact | capacity_recommend
  const [cabinFacts, setCabinFacts] = useState(null);
  const [pendingAvailability, setPendingAvailability] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const fetchCabinFacts = async () => {
      try {
        const res = await fetch(`${API_BASE}/cabins/?status_filter=available`);
        if (!res.ok) {
          return;
        }
        const data = await res.json();
        const cabins = Array.isArray(data) ? data : data?.cabins || [];
        if (!cabins.length) return;

        const simplifiedCabins = cabins.map((cabin) => ({
          id: cabin.id,
          name: cabin.name,
          capacity: Number(cabin.capacity) || null,
          price_per_night: Number(cabin.price_per_night) || null,
        }));

        const priceValues = cabins
          .map((cabin) => Number(cabin.price_per_night))
          .filter((value) => Number.isFinite(value));
        const capacityValues = cabins
          .map((cabin) => Number(cabin.capacity))
          .filter((value) => Number.isFinite(value));

        const minPrice = priceValues.length ? Math.min(...priceValues) : null;
        const maxPrice = priceValues.length ? Math.max(...priceValues) : null;
        const uniqueCapacities = capacityValues.length
          ? [...new Set(capacityValues)].sort((a, b) => a - b)
          : [];
        const sampleCabins = cabins
          .filter((cabin) => Boolean(cabin?.name))
          .slice(0, 3)
          .map((cabin) => cabin.name);

        setCabinFacts({
          cabinCount: cabins.length,
          minPrice,
          maxPrice,
          uniqueCapacities,
          sampleCabins,
          cabins: simplifiedCabins,
        });
      } catch (error) {
        console.error('Error fetching cabin stats for chatbot', error);
      }
    };

    fetchCabinFacts();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  function addBotMessage(text) {
    setMessages(prev => [
      ...prev,
      { text, sender: 'bot', timestamp: new Date() }
    ]);
  }

  const botResponses = {
    greeting: [
      "Hello! Welcome to The Cabin Oasis! 🏔️ How can I help you today?",
      "Hi there! I'm here to help you find your perfect cabin getaway!",
      "Welcome! Need help with booking or have questions about our cabins?"
    ],
    booking: [
      "You can book a cabin by visiting our Rooms page to see all options, or go directly to Booking if you already know what you want!",
      "To book: 1) Browse our Rooms 2) Click 'Book Now' on your favorite cabin 3) Fill out the booking form. Easy! 🏠",
      "Ready to book? Check out our 6 cabin types from $150-$400/night. Which interests you most?"
    ],
    prices: [
      "Our cabins range from $150/night (Standard Cabin) to $400/night (Lakeside Cabin). All include WiFi, kitchen, and beautiful views! 💰",
      "Pricing: Standard $150, Forest View $200, Deluxe $250, Mountain View $300, Suite $350, Lakeside $400 per night.",
      "Great value! Starting at just $150/night. All cabins have full amenities and stunning nature views."
    ],
    amenities: [
      "Every cabin includes: WiFi, full kitchen, private bathroom, outdoor seating, heating/AC, and free parking. Plus amazing nature views! 🌲",
      "All cabins are fully equipped with modern amenities while maintaining that cozy cabin feel. Kitchen, WiFi, parking included!",
      "You'll have everything you need: kitchen facilities, WiFi, private bathroom, parking, and of course, beautiful surroundings!"
    ],
    capacity: [
      "Our cabins accommodate 2-6 guests. Standard (2), Forest View (3), Deluxe & Mountain View (4), Suite & Lakeside (6). Perfect for couples or families! 👨‍👩‍👧‍👦",
      "Group size? We have cabins for 2 people up to 6 people. What's your group size?",
      "Whether it's a romantic getaway (2 guests) or family vacation (6 guests), we have the perfect cabin size!"
    ],
    location: [
      "We're nestled in the heart of the forest, just 30 minutes from town. Free parking available, and the views are absolutely breathtaking! 🌲",
      "Perfect location - close enough to town for convenience, far enough for peace and quiet. Easy driving access.",
      "Our cabins offer the best of both worlds: forest tranquility with nearby town access. GPS-friendly location!"
    ],
    cancellation: [
      "Free cancellation up to 48 hours before check-in. After that, first night is non-refundable. Flexible booking for peace of mind! ✅",
      "We offer flexible cancellation - cancel 48 hours before arrival for full refund. Plans change, we get it!",
      "Book with confidence! 48-hour free cancellation policy. Need to modify? Just let us know!"
    ],
    contact: [
      "Questions? Email us at info@cabinoasis.com or call 555-CABIN. We're here to help! 📧",
      "Reach out anytime! Email: info@cabinoasis.com | Phone: 555-CABIN | We respond quickly!",
      "Need human help? Contact our friendly team at info@cabinoasis.com or 555-CABIN."
    ],
    default: [
      "That's interesting! For bookings, visit our Rooms page. For specific questions, I can help with pricing, amenities, location, or cancellation policy. What would you like to know?",
      "I can help with: booking information, prices ($150-$400), amenities, cabin types, location details, or contact info. What interests you?",
      "Great question! I'm here to help with cabin bookings, pricing, amenities, locations, and more. What specific information do you need?"
    ]
  };

  const getRandomResponse = (key) => {
    const options = botResponses[key] || [];
    if (!options.length) return '';
    return options[Math.floor(Math.random() * options.length)];
  };

  const formatCurrency = (value) => {
    if (value === null || value === undefined) return null;
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return null;
    return numeric.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    });
  };

  const getCapacityBucket = (count) => {
    if (!Number.isFinite(count) || count <= 0) return null;
    if (count <= 2) return { min: 1, max: 2, label: 'cozy cabins for up to 2 guests' };
    if (count <= 4) return { min: count, max: 4, label: 'cabins that host up to 4 guests' };
    if (count <= 6) return { min: count, max: 6, label: 'our largest cabins that host up to 6 guests' };
    return null;
  };

  const buildPriceResponse = () => {
    if (
      cabinFacts?.cabinCount > 0 &&
      cabinFacts?.minPrice !== null &&
      cabinFacts?.maxPrice !== null
    ) {
      const min = formatCurrency(cabinFacts.minPrice);
      const max = formatCurrency(cabinFacts.maxPrice);
      const sameRange = min && max && min === max;
      const sampleText = cabinFacts.sampleCabins?.length
        ? ` Popular picks: ${cabinFacts.sampleCabins.join(', ')}.`
        : '';

      if (min && max) {
        return `We currently have ${cabinFacts.cabinCount} cabin option${
          cabinFacts.cabinCount === 1 ? '' : 's'
        } priced between ${sameRange ? min : `${min} and ${max}`} per night.${sampleText}`;
      }
    }
    return getRandomResponse('prices');
  };

  const buildCapacityResponse = () => {
    if (cabinFacts?.uniqueCapacities?.length) {
      const caps = cabinFacts.uniqueCapacities;
      const lowest = caps[0];
      const highest = caps[caps.length - 1];
      const listText = caps
        .map((cap) => `${cap} guest${cap > 1 ? 's' : ''}`)
        .join(', ');
      return `Cabins currently host between ${lowest} and ${highest} guests. We have layouts for ${listText}. Tell me your group size and I'll show the best fits.`;
    }
    return getRandomResponse('capacity');
  };

  const getBotResponse = (userInput) => {
    const input = userInput.toLowerCase();
    
    if (input.includes('hello') || input.includes('hi') || input.includes('hey')) {
      return { key: 'greeting', text: getRandomResponse('greeting') };
    } else if (input.includes('book') || input.includes('reserve') || input.includes('booking')) {
      return { key: 'booking', text: getRandomResponse('booking') };
    } else if (input.includes('price') || input.includes('cost') || input.includes('rate') || input.includes('$')) {
      return { key: 'prices', text: buildPriceResponse() };
    } else if (input.includes('amenit') || input.includes('include') || input.includes('wifi') || input.includes('kitchen')) {
      return { key: 'amenities', text: getRandomResponse('amenities') };
    } else if (input.includes('capacity') || input.includes('guest') || input.includes('people') || input.includes('size')) {
      return { key: 'capacity_prompt', text: buildCapacityResponse() };
    } else if (input.includes('location') || input.includes('where') || input.includes('address') || input.includes('parking')) {
      return { key: 'location', text: getRandomResponse('location') };
    } else if (input.includes('cancel') || input.includes('refund') || input.includes('policy')) {
      return { key: 'cancellation', text: getRandomResponse('cancellation') };
    } else if (input.includes('contact') || input.includes('email') || input.includes('phone') || input.includes('help')) {
      return { key: 'contact', text: getRandomResponse('contact') };
    } else {
      return { key: 'default', text: getRandomResponse('default') };
    }
  };

  const recommendCabinsForGuests = (guestCount) => {
    if (!cabinFacts?.cabins?.length) {
      return null;
    }

    const matchingCabins = cabinFacts.cabins
      .filter((cabin) => cabin.capacity && cabin.capacity >= guestCount)
      .sort((a, b) => a.capacity - b.capacity)
      .slice(0, 3);

    if (!matchingCabins.length) {
      return null;
    }

    const bullets = matchingCabins.map((cabin) => {
      const priceText = formatCurrency(cabin.price_per_night);
      return `• ${cabin.name} – up to ${cabin.capacity} guests${priceText ? ` (${priceText}/night)` : ''}`;
    });

    return bullets.join('\n');
  };

  const handleBotResponse = async (userInput) => {
    setIsTyping(true);
    try {
      const input = userInput.trim();
      const inputLower = input.toLowerCase();

      if (mode === 'capacity_recommend') {
        const guestsMatch = inputLower.match(/(\d+)/);
        if (!guestsMatch) {
          addBotMessage('Please tell me the number of guests (for example: `4` or `4 guests`).');
          return;
        }

        const guestCount = parseInt(guestsMatch[1], 10);
        if (!Number.isFinite(guestCount) || guestCount <= 0) {
          addBotMessage('I need a positive number of guests. Try again like `2 guests`.');
          return;
        }

        if (guestCount >= 7) {
          addBotMessage(
            'Our cabins host up to 6 guests each. For 7+ people we recommend booking two cabins or contacting us so we can help arrange adjacent stays.'
          );
          setMode('idle');
          setPendingAvailability(null);
          return;
        }

        const recommendation = recommendCabinsForGuests(guestCount);
        if (!recommendation) {
          addBotMessage(
            `I couldn't find cabin suggestions for ${guestCount} guest${guestCount > 1 ? 's' : ''}. Try asking to check availability with your travel dates, or contact us for manual help.`
          );
        } else {
          addBotMessage(
            `Here are good matches for ${guestCount} guest${guestCount > 1 ? 's' : ''}:
${recommendation}

Want me to check specific dates? Say something like "2026-07-10 to 2026-07-14" and I'll confirm availability for ${guestCount} guest${guestCount > 1 ? 's' : ''}.`
          );
        }
        setPendingAvailability({ guestCount });
        setMode('capacity_dates');
        return;
      }

      if (mode === 'capacity_dates') {
        const dateMatch = inputLower.match(/(\d{4}-\d{2}-\d{2})\s*(?:to|-|until)\s*(\d{4}-\d{2}-\d{2})/);
        if (!dateMatch) {
          addBotMessage('Please send the dates like `2026-07-10 to 2026-07-14` so I can check availability.');
          return;
        }

        const guestCount = pendingAvailability?.guestCount;
        if (!guestCount) {
          addBotMessage('I lost track of your guest count. Tell me how many guests you have again.');
          setMode('capacity_recommend');
          return;
        }

        const capacityBucket = getCapacityBucket(guestCount);
        if (!capacityBucket) {
          addBotMessage('I had trouble matching that guest count. Please try again with a number between 1 and 6.');
          setMode('idle');
          setPendingAvailability(null);
          return;
        }

        const checkIn = dateMatch[1];
        const checkOut = dateMatch[2];

        try {
          const res = await fetch(`${API_BASE}/cabins/available/${checkIn}/${checkOut}`);
          if (!res.ok) {
            addBotMessage('I could not verify availability right now. Please try again later or use the Rooms page.');
            return;
          }
          const data = await res.json();
          const cabins = data.cabins || [];

          const bucketMatches = cabins.filter((c) => typeof c.capacity === 'number' && c.capacity >= guestCount && c.capacity <= capacityBucket.max);

          if (bucketMatches.length) {
            const lines = bucketMatches.slice(0, 3).map((c) => `• ${c.name} (ID ${c.id}) – up to ${c.capacity} guests, ${c.price_per_night} per night`);
            addBotMessage(
              `Great! These cabin(s) are open for ${guestCount} guest${guestCount > 1 ? 's' : ''} from ${checkIn} to ${checkOut}:
${lines.join('\n')}

Ready to book? Visit the Rooms page and pick one of them with those dates.`
            );
          } else if (cabins.length) {
            const fallbackLines = cabins.slice(0, 3).map((c) => `• ${c.name} – fits up to ${c.capacity} guests, ${c.price_per_night} per night`);
            addBotMessage(
              `Nothing in that exact size is free for ${checkIn} to ${checkOut}, but these cabins are available and may work if you can adjust your group:
${fallbackLines.join('\n')}

Let me know if you'd like different dates or need help choosing.`
            );
          } else {
            addBotMessage(`I couldn't find any cabins available for ${checkIn} to ${checkOut}. Try different dates or contact us and we can help manually.`);
          }
        } catch (error) {
          addBotMessage('Something went wrong while checking availability. Please try again later.');
        } finally {
          setMode('idle');
          setPendingAvailability(null);
        }
        return;
      }

      if (mode === 'booking_helper') {
        // Expect something like: 2024-07-10 to 2024-07-14, 2 guests
        const dateMatch = input.match(/(\d{4}-\d{2}-\d{2})\s*(?:to|-)\s*(\d{4}-\d{2}-\d{2})/);
        const guestsMatch = input.match(/(\d+)\s*guest/);

        if (!dateMatch || !guestsMatch) {
          addBotMessage(
            "I couldn't understand those dates. Please write it like `2024-07-10 to 2024-07-14, 2 guests`."
          );
          return;
        }

        const checkIn = dateMatch[1];
        const checkOut = dateMatch[2];
        const guests = parseInt(guestsMatch[1], 10) || 1;

        if (guests >= 7) {
          addBotMessage(
            'Right now we can host up to 6 guests in a single cabin. Please reduce the group size or contact us for special arrangements.'
          );
          return;
        }

        const capacityBucket = getCapacityBucket(guests);
        if (!capacityBucket) {
          addBotMessage('I had trouble matching that guest count. Please try again with a number between 1 and 6.');
          return;
        }

        try {
          const res = await fetch(`${API_BASE}/cabins/available/${checkIn}/${checkOut}`);
          if (!res.ok) {
            addBotMessage('I had trouble checking availability. Please try again later or use the Rooms page.');
            return;
          }
          const data = await res.json();
          const cabins = data.cabins || [];

          const filteredCabins = cabins.filter((c) => {
            if (typeof c.capacity !== 'number') return false;
            return c.capacity >= guests && c.capacity <= capacityBucket.max;
          });

          if (!filteredCabins.length) {
            addBotMessage(
              `I couldn't find any available cabins for ${checkIn} to ${checkOut} that fit ${guests} guest${guests > 1 ? 's' : ''} in that cabin size category. Try different dates or adjust the guest count, or contact us and we can help manually.`
            );
            return;
          }

          const lines = filteredCabins.slice(0, 3).map(c =>
            `• ${c.name} (ID ${c.id}) – up to ${c.capacity} guests, ${c.price_per_night} per night`
          );
          let reply = `Great news! I found ${filteredCabins.length} cabin(s) available for ${checkIn} to ${checkOut} that match ${capacityBucket.label}:
${lines.join('\n')}`;
          reply +=
            '\n\nYou can click on a cabin on the Rooms page and start a booking with those dates.';
          addBotMessage(reply);
        } catch (e) {
          addBotMessage('Something went wrong while checking availability. Please try again later.');
        }
        return;
      }

      if (mode === 'booking_lookup') {
        // Expect: BookingId | email
        const parts = input.split('|').map(p => p.trim()).filter(Boolean);
        if (parts.length < 2 || !parts[1].includes('@')) {
          addBotMessage(
            'To check a booking, please send: `BookingID | your@email.com` (for example: `12 | john@example.com`).'
          );
          return;
        }

        const [idPart, email] = parts;
        const idMatch = idPart.match(/(\d+)/);
        const bookingId = idMatch ? idMatch[1] : null;

        if (!bookingId) {
          addBotMessage(
            'I could not find a booking number in your message. Please send it like: `12 | john@example.com`.'
          );
          return;
        }

        try {
          const res = await fetch(
            `${API_BASE}/bookings/public-exists/${bookingId}?email=${encodeURIComponent(email)}`
          );
          if (!res.ok) {
            addBotMessage(
              'I could not check your booking right now. Please try again later or use the contact form.'
            );
            return;
          }
          const data = await res.json();
          if (data.exists) {
            addBotMessage(
              `Yes, I found a booking with ID #${bookingId} for that email. For full details or changes, please check your confirmation email or contact us.`
            );
          } else {
            addBotMessage(
              `I could not find any booking with ID #${bookingId} for that email. Please double-check both the booking number and the email used when booking.`
            );
          }
        } catch (e) {
          addBotMessage(
            'Something went wrong while checking your booking. Please try again later or contact us directly.'
          );
        }

        setMode('idle');
        return;
      }

      if (mode === 'collect_contact') {
        // Expect: Name | Email | Your question
        const parts = input.split('|').map(p => p.trim()).filter(Boolean);
        if (parts.length < 3 || !parts[1].includes('@')) {
          addBotMessage(
            'To contact us via chat, please send: `Your Name | your@email.com | Your question`.'
          );
          return;
        }

        const [name, email, question] = parts;

        try {
          const res = await fetch(`${API_BASE}/messages/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name,
              email,
              phone: null,
              customer_id: null,
              subject: 'Website chatbot inquiry',
              content: question,
              category: 'general',
            }),
          });

          if (!res.ok) {
            addBotMessage(
              'I could not send your message right now. Please try again later or email us directly.'
            );
            return;
          }

          addBotMessage(
            "Thank you! I've sent your message to our team. We'll reply to you by email as soon as possible."
          );
          setMode('idle');
        } catch (e) {
          addBotMessage(
            'Something went wrong while sending your message. Please try again later or use the contact form.'
          );
        }
        return;
      }

      // Default keyword-based FAQ bot
      const botResponse = getBotResponse(userInput);
      addBotMessage(botResponse.text);

      if (botResponse.key === 'capacity_prompt') {
        setMode('capacity_recommend');
      } else if (mode === 'capacity_recommend' || mode === 'capacity_dates') {
        setMode('idle');
      }
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendMessage = () => {
    if (inputValue.trim() === '') return;

    const text = inputValue;
    const userMessage = { text, sender: 'user', timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    handleBotResponse(text);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickReplies = [
    {
      text: 'Check availability',
      action: () => {
        setMode('booking_helper');
        addBotMessage(
          'Tell me your dates and guests like this: `2024-07-10 to 2024-07-14, 2 guests` and I will check which cabins are free.'
        );
      },
    },
    {
      text: 'Check my booking',
      action: () => {
        setMode('booking_lookup');
        addBotMessage(
          'Please send: `BookingID | your@email.com` (for example: `12 | john@example.com`).'
        );
      },
    },
    {
      text: 'Contact us',
      action: () => {
        setMode('collect_contact');
        addBotMessage(
          'To contact us via chat, please send: `Your Name | your@email.com | Your question`.'
        );
      },
    },
    {
      text: 'Cabin info',
      action: () => {
        setMode('idle');
        addBotMessage(
          'Ask me about booking, prices, amenities, location, or cancellation policy, and I will share details.'
        );
      },
    },
  ];

  useEffect(() => {
    // Welcome message after 2 seconds
    const timer = setTimeout(() => {
      const welcomeMessage = {
        text: botResponses.greeting[0],
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Listen for custom event to open chatbot
  useEffect(() => {
    const handleOpenChatbot = () => {
      setIsOpen(true);
    };

    window.addEventListener('openChatbot', handleOpenChatbot);
    
    return () => {
      window.removeEventListener('openChatbot', handleOpenChatbot);
    };
  }, []);

  return (
    <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999 }}>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-fern-600 hover:bg-fern-500 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group"
          style={{ width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
          </svg>
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            1
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-sm h-[70vh] max-h-[620px] min-h-[420px] flex flex-col border border-gray-200"
          style={{ backgroundColor: 'white' }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-fern-500 to-fern-600 text-white p-4 rounded-t-2xl">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold">Cabin Assistant</h3>
                  <p className="text-xs opacity-90">Usually responds instantly</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full p-2 transition-colors"
                style={{ 
                  width: '32px', 
                  height: '32px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  backgroundColor: '#000000',
                  color: '#ffffff'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#333333'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#000000'}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50" style={{ backgroundColor: '#ffffff' }}>
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                    message.sender === 'user'
                      ? 'bg-fern-600 text-white'
                      : 'bg-white text-gray-800 border border-gray-200'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                  <p className={`text-xs mt-1 ${message.sender === 'user' ? 'text-fern-100' : 'text-gray-400'}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-800 border border-gray-200 px-4 py-2 rounded-2xl">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies */}
          {messages.length > 0 && !isTyping && (
            <div className="px-4 py-2 bg-white border-t border-gray-200" style={{ backgroundColor: '#ffffff' }}>
              <div className="flex flex-wrap gap-2">
                {quickReplies.map((reply, index) => (
                  <button
                    key={index}
                    onClick={reply.action}
                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full transition-colors"
                  >
                    {reply.text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 bg-white border-t border-gray-200 rounded-b-2xl" style={{ backgroundColor: '#ffffff' }}>
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about cabins, booking, or amenities..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-fern-500 focus:border-transparent"
              />
              <button
                onClick={handleSendMessage}
                disabled={inputValue.trim() === ''}
                className="bg-fern-600 hover:bg-fern-500 disabled:bg-gray-300 text-white p-2 rounded-full transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot;
