document.addEventListener('DOMContentLoaded', () => {

    // --- 1. DATA STRUCTURE: ROOMS (UPDATED WITH 10 IMAGES PER ROOM) ---
    const PLACEHOLDER_IMAGES = (prefix) => {
        return Array.from({ length: 10 }, (_, i) => `${prefix}${i + 1}.jpg`);
    };

    const ROOM_DATA = {
        single: {
            name: "Single Room",
            price: 50,
            maxGuests: 1, // Max 1 guest for a single room
            availableRooms: 12,
            description: "Cozy room for solo travelers, includes basic amenities and free Wi-Fi.",
            images: PLACEHOLDER_IMAGES('single') 
        },
        double: {
            name: "Double Room",
            price: 85,
            maxGuests: 2, // Max 2 guests
            availableRooms: 10,
            description: "Comfortable room with a large bed for two guests.",
            images: PLACEHOLDER_IMAGES('double')
        },
        suite: {
            name: "Deluxe Suite",
            price: 150,
            maxGuests: 4, // Max 4 guests
            availableRooms: 5,
            description: "Spacious suite with a separate living area and premium features.",
            images: PLACEHOLDER_IMAGES('suite')
        },
        standard: {
            name: "Standard Room",
            price: 70,
            maxGuests: 2, // Max 2 guests
            availableRooms: 15,
            description: "A comfortable, spacious room offering great value and essential amenities.",
            images: PLACEHOLDER_IMAGES('standard')
        },
        executive: {
            name: "Executive Room",
            price: 120,
            maxGuests: 2, // Max 2 guests
            availableRooms: 8,
            description: "Elevated comfort with a dedicated workspace, luxurious bedding, and city views.",
            images: PLACEHOLDER_IMAGES('executive')
        }
    };
    
    // --- 2. GLOBAL ELEMENTS & UTILITY FUNCTIONS ---
    
    const allModals = document.querySelectorAll('.modal');
    const BOOKINGS_KEY = 'royalGoldBookings';
    const MAX_GUESTS_OVERALL = 5; // Global maximum guest limit requested

    function openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            allModals.forEach(m => m.style.display = 'none'); 
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
            
            if (modalId === 'booking-history-view') {
                displayBookingHistory();
            }
        }
    }

    function closeModal(modalId = null) {
        if (modalId) {
            const specificModal = document.getElementById(modalId);
            if (specificModal) specificModal.style.display = 'none';
        } else {
             allModals.forEach(modal => modal.style.display = 'none');
        }
        
        // Only unlock scroll if no other modal is currently visible
        if (document.querySelectorAll('.modal[style*="block"]').length === 0) {
            document.body.style.overflow = 'auto';
        }
    }

    function smoothScrollTo(targetId) {
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop,
                behavior: 'smooth'
            });
        }
    }

    // Attach listeners to all modal close buttons (X)
    document.querySelectorAll('.modal-content span[id^="close-"]').forEach(closeBtn => {
        closeBtn.addEventListener('click', () => closeModal()); // Use generic close
    });
    
    // Close modal if user clicks outside of the modal content (backdrop)
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeModal();
        }
    });
    
    // --- 3. MENU AND SCROLLING HANDLERS ---
    
    const icon = document.getElementById("icons");
    const nav = document.querySelector("nav");
    const closeMenuBtn = document.getElementById("close-btn");
    const ANIM_DURATION = 500;
    
    function openMenu() {
        if (nav.hideTimer) clearTimeout(nav.hideTimer);
        nav.style.display = "block";
        nav.classList.remove("hide");
        requestAnimationFrame(() => nav.classList.add("show"));
    }

    function closeMenu() {
        nav.classList.remove("show");
        nav.classList.add("hide");
        if (nav.hideTimer) clearTimeout(nav.hideTimer);
        nav.hideTimer = setTimeout(() => {
            nav.style.display = "none";
            nav.classList.remove("hide");
            nav.hideTimer = null;
        }, ANIM_DURATION);
    }

    icon.addEventListener("click", () => {
        const isVisible = window.getComputedStyle(nav).display !== "none";
        if (!isVisible) openMenu(); else closeMenu();
    });

    closeMenuBtn.addEventListener("click", closeMenu);

    document.addEventListener("click", e => {
        const clickedInside = nav.contains(e.target) || icon.contains(e.target);
        if (!clickedInside && window.getComputedStyle(nav).display !== "none") closeMenu();
    });
    
    document.querySelectorAll('.scroll-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            closeMenu();
            const targetId = link.getAttribute('data-target');
            smoothScrollTo(targetId);
        });
    });

    document.querySelectorAll('.modal-opener').forEach(opener => {
        opener.addEventListener('click', (e) => {
            e.preventDefault();
            closeMenu();
            const modalId = opener.getAttribute('data-modal-target');
            
            // Check if the link has a room type target (from the list or the detail modal)
            const roomType = opener.getAttribute('data-room-type-target');
            if (roomType) {
                prepareBookingForm(roomType);
            }
            
            openModal(modalId); 
        });
    });
    
    // --- 4. ROOM DETAIL MODAL HANDLER ---
    
    document.querySelectorAll('.room-select-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const roomType = btn.getAttribute('data-room-type');
            loadRoomDetails(roomType);
            openModal('room-detail-modal'); 
        });
    });
    
    function loadRoomDetails(roomType) {
        const room = ROOM_DATA[roomType];
        if (!room) return;
        
        document.getElementById('detail-modal-title').textContent = room.name;
        document.getElementById('room-price-display').textContent = `$${room.price}`;
        document.getElementById('room-number-display').textContent = room.availableRooms;
        
        const bookDirectBtn = document.querySelector('#room-detail-modal .book-now-direct');
        bookDirectBtn.setAttribute('data-room-type-target', roomType);
        bookDirectBtn.textContent = `Book ${room.name} Now`;

        const wrapper = document.querySelector('#detail-room-slider .room-slider-wrapper');
        
        wrapper.innerHTML = '';
        room.images.forEach((imgSrc, index) => {
            const slide = document.createElement('div');
            slide.className = 'room-slide';
            slide.innerHTML = `<img src="${imgSrc}" alt="${room.name} image ${index + 1}">`;
            wrapper.appendChild(slide);
        });
        
        currentRoom = 0;
        sliderRoomSlides = document.querySelectorAll('#detail-room-slider .room-slide');
        wrapper.style.transform = `translateX(0%)`;
    }
    
    // --- 5. ROOM SLIDER LOGIC ---
    
    let currentRoom = 0;
    let sliderRoomSlides = [];
    
    function roomShowSlide(i) {
        const wrapper = document.querySelector('#detail-room-slider .room-slider-wrapper');
        const slideCount = sliderRoomSlides.length;

        if (!wrapper || slideCount === 0) return;

        currentRoom = (i % slideCount + slideCount) % slideCount;
        
        const offset = currentRoom * 100;
        wrapper.style.transform = `translateX(-${offset}%)`;
    }

    function roomNext() { roomShowSlide(currentRoom + 1); }
    function roomPrev() { roomShowSlide(currentRoom - 1); }
    
    function attachRoomSliderArrows() {
        const sliderContainer = document.querySelector('#detail-room-slider');
        if (!sliderContainer || sliderContainer.querySelector('.prev')) return;

        const prevBtn = document.createElement('div');
        prevBtn.className = 'prev';
        prevBtn.innerHTML = '&#10094;'; 
        prevBtn.addEventListener('click', roomPrev);

        const nextBtn = document.createElement('div');
        nextBtn.className = 'next';
        nextBtn.innerHTML = '&#10095;'; 
        nextBtn.addEventListener('click', roomNext);

        sliderContainer.appendChild(prevBtn);
        sliderContainer.appendChild(nextBtn);
    }
    
    // --- 6. BOOKING FORM PREPARATION ---
    
    function prepareBookingForm(roomType) {
        const room = ROOM_DATA[roomType];
        if (!room) return;
        
        document.getElementById('form-room-type').value = roomType;
        document.getElementById('form-room-price').value = room.price;
        document.getElementById('room-type-info').innerHTML = `<strong>${room.name} ($${room.price}/Night)</strong>`;
        
        // Set the maxGuests constraint for the input field
        const guestsInput = document.getElementById('number');
        
        // Use the smaller of the room's maxGuests or the global MAX_GUESTS_OVERALL
        const maxAllowed = Math.min(room.maxGuests, MAX_GUESTS_OVERALL);
        
        guestsInput.value = 1; // Default to 1
        guestsInput.max = maxAllowed;
    }
    
    // --- 7. LOCAL STORAGE AND HISTORY MANAGEMENT ---
    
    function getBookings() {
        const json = localStorage.getItem(BOOKINGS_KEY);
        return json ? JSON.parse(json) : [];
    }

    function saveBookings(bookings) {
        localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
    }
    
    function cleanupExpiredBookings() {
        let bookings = getBookings();
        const now = Date.now();
        const twentyFourHoursInMs = 24 * 60 * 60 * 1000;

        const nonExpiredBookings = bookings.filter(booking => {
            const submissionTime = parseInt(booking.id, 10);
            return (now - submissionTime) < twentyFourHoursInMs;
        });

        if (bookings.length !== nonExpiredBookings.length) {
            saveBookings(nonExpiredBookings);
        }
    }
    
    function displayBookingHistory() {
        cleanupExpiredBookings();
        
        const historyList = document.getElementById('history-list');
        const bookings = getBookings().sort((a, b) => b.id - a.id);
        historyList.innerHTML = '';

        if (bookings.length === 0) {
            historyList.innerHTML = '<p class="no-bookings">You have no active or past bookings. (Bookings are deleted 24 hours after submission)</p>';
            return;
        }

        bookings.forEach(booking => {
            const item = document.createElement('div');
            item.className = 'booking-item';
            item.setAttribute('data-id', booking.id);
            
            const formatDispDate = (dateStr) => {
                const date = new Date(dateStr + 'T00:00:00');
                return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
            };

            item.innerHTML = `
                <div class="booking-details">
                    <strong>${booking.roomType}</strong><br>
                    Booking ID (Room No): <strong>${booking.roomNumber}</strong><br>
                    Check-in: ${formatDispDate(booking.checkIn)} - Check-out: ${formatDispDate(booking.checkOut)}<br>
                    Guests: ${booking.guests} | Cost: <strong>$${booking.totalPrice}</strong>
                </div>
                <button class="cancel-btn" data-id="${booking.id}" aria-label="Cancel booking">&#10006;</button>
            `;
            historyList.appendChild(item);
        });
        
        document.querySelectorAll('.cancel-btn').forEach(btn => {
            btn.addEventListener('click', cancelBooking);
        });
    }

    function cancelBooking(e) {
        const bookingId = e.target.getAttribute('data-id');
        let bookings = getBookings();
        
        const updatedBookings = bookings.filter(b => b.id !== bookingId);
        saveBookings(updatedBookings);
        
        displayBookingHistory();
        // Since we are moving to a custom modal, let's keep this simple alert for cancellation
        alert('Booking successfully cancelled.'); 
    }

    // --- 8. FORM SUBMISSION HANDLER (FIXED NaN, GUEST LIMIT, NEW ID FORMAT, CUSTOM MESSAGE MODAL) ---

    // Function to generate a formatted room number like #201
    function generateRoomNumber() {
        // Generate a random 3-digit number (e.g., 001 to 999)
        const roomNum = Math.floor(Math.random() * 999) + 1;
        // Format it with a leading pound sign and 3 digits
        return `#${String(roomNum).padStart(3, '0')}`;
    }

    const bookingForm = document.getElementById('main-booking-form');

    bookingForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        const data = {};
        formData.forEach((value, key) => data[key] = value);
        
        const checkIn = new Date(data['check_in']);
        const checkOut = new Date(data['check_out']);
        const guests = parseInt(data['guests'], 10);
        const roomTypeKey = data['room_type_selected'];
        const roomData = ROOM_DATA[roomTypeKey];
        
        // 1. Basic Date Validation
        if (checkOut <= checkIn) {
            alert("Check-out date must be after the Check-in date.");
            return;
        }

        // 2. Global Guest Limit Check (Must not be more than 5)
        if (guests > MAX_GUESTS_OVERALL) {
            alert(`The maximum allowed number of guests per booking is ${MAX_GUESTS_OVERALL}. Please adjust the number of guests.`);
            return;
        }

        // 3. Room-Specific Guest Limit Check
        if (guests > roomData.maxGuests) {
            alert(`The selected room (${roomData.name}) can only accommodate a maximum of ${roomData.maxGuests} guests. Please adjust the number of guests.`);
            return;
        }

        const oneDay = 1000 * 60 * 60 * 24;
        const diffTime = checkOut - checkIn;
        const diffDays = Math.ceil(diffTime / oneDay); 
        
        // --- FIX: Correctly reference the hidden form field NAME: 'room_price' ---
        const roomPrice = parseFloat(data['room_price']); 
        // ------------------------------------------------------------------

        if (isNaN(roomPrice)) {
             alert("Error: Price calculation failed. Please re-select the room.");
             return;
        }
        
        const totalPrice = diffDays * roomPrice;

        const submissionTimestamp = Date.now().toString();
        
        // --- NEW: Generate formatted room number ---
        const roomNumber = generateRoomNumber(); 

        const newBooking = {
            id: submissionTimestamp,
            roomNumber: roomNumber,
            roomType: roomData.name, // Use the correct name from roomData
            totalPrice: totalPrice.toFixed(2),
            checkIn: data['check_in'],
            checkOut: data['check_out'],
            guests: guests,
            status: "Pending Payment"
        };
        
        let bookings = getBookings();
        bookings.push(newBooking);
        saveBookings(bookings);
        
        // --- CUSTOM SUBMISSION MESSAGE (HTML Formatting for Custom Modal) ---
        const htmlMessage = 
            `<h2>🛎️ ROYAL GOLD HOTEL 🛎️</h2>` +
            `<p>-----------------------------------------------------</p>` +
            `<p>Room Type: <strong>${newBooking.roomType}</strong></p>` +
            `<p>Booking ID (Room No): <strong>${newBooking.roomNumber}</strong></p>` +
            `<p>Check-in: ${newBooking.checkIn}</p>` +
            `<p>Check-out: ${newBooking.checkOut}</p>` +
            `<p>Price per Night: $${roomPrice.toFixed(2)}</p>` +
            `<p>Total Est. Cost (${diffDays} night(s)): <strong>$${newBooking.totalPrice}</strong></p>` +
            `<p>-----------------------------------------------------</p>` +
            `<p style="margin-top: 15px;">Your booking request has been successfully submitted to our system.</p>` +
            `<p style="margin-top: 10px; font-style: italic;">A member of the Royal Gold Hotel staff will contact you via email or phone within 2 hours to confirm your details and process payment options.</p>` +
            `<p style="margin-top: 10px;">Thank you for choosing Royal Gold Hotel!</p>`;

        // Insert the HTML into the custom modal display area
        document.getElementById('confirmation-message-display').innerHTML = htmlMessage;
        
        // Open the custom confirmation modal
        openModal('confirmation-modal');

        // Close the booking form immediately (in case it was still open)
        closeModal('booking-modal');
        
        form.reset();
    });
    
    // --- NEW SECTION: INTERSECTION OBSERVER FOR FADE-IN ---
    // This function is now correctly defined within the DOMContentLoaded scope.
    function setupScrollAnimations() {
        const animatedElements = document.querySelectorAll('.animate-on-scroll');
        
        // The Intersection Observer is the modern, efficient way to detect when an element enters the viewport.
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                // If the element is currently visible (intersecting)
                if (entry.isIntersecting) {
                    // Add the 'is-visible' class, which triggers the CSS animation
                    entry.target.classList.add('is-visible');
                    
                    // Stop observing this element once it has animated
                    observer.unobserve(entry.target);
                }
            });
        }, {
            // threshold: 0.1 means the animation will start when 10% of the element is visible
            threshold: 0.1 
        });

        // Loop through all elements marked with the class and start observing them
        animatedElements.forEach(element => {
            observer.observe(element);
        });
    }

    // --- 9. INITIAL SETUP ---
    attachRoomSliderArrows();
    cleanupExpiredBookings();
    
    // **CALL THE NEW ANIMATION SETUP FUNCTION HERE**
    setupScrollAnimations(); 
    
    // Add listener for the new OK button in the confirmation modal
    document.getElementById('confirmation-ok-btn').addEventListener('click', () => {
        closeModal('confirmation-modal');
    });

    const headerSlides = document.querySelectorAll('.header-slide'); 
    let headerIndex = 0;

    function headerShowSlide(i) {
        headerSlides.forEach(slide => slide.classList.remove('active'));
        if (headerSlides[i]) {
            headerSlides[i].classList.add('active');
        }
    }

    headerShowSlide(headerIndex);
    setInterval(() => {
        headerIndex = (headerIndex + 1) % headerSlides.length;
        headerShowSlide(headerIndex);
    }, 4000);
});












// --- IN-PLACE ZOOM GALLERY SCRIPT ---
const featureCards = document.querySelectorAll('.dining-feature-card');

featureCards.forEach(card => {
    const viewButton = card.querySelector('.view-image-btn');
    const imageContainer = card.querySelector('.feature-image-container');
    const contentOverlay = card.querySelector('.card-content-overlay');

    // Attach click listener to the VIEW button
    viewButton.addEventListener('click', (e) => {
        // Prevent the click from bubbling up to the card itself
        e.stopPropagation(); 
        
        // Check if the card is already active
        const isActive = card.classList.contains('active');
        
        if (!isActive) {
            // SHOW IMAGE (Zoom In)
            card.classList.add('active');
            
            // OPTIONAL: Add a listener to click anywhere on the image to close it
            // We use setTimeout to ensure the click listener is only active *after* the transition
            setTimeout(() => {
                const closeImage = () => {
                    card.classList.remove('active');
                    imageContainer.removeEventListener('click', closeImage);
                };
                imageContainer.addEventListener('click', closeImage);
            }, 500); // 500ms should match the CSS transition duration
            
        } else {
            // HIDE IMAGE (Zoom Out) - This case would be handled by the click on the image itself
            // but is here for completeness if needed elsewhere.
            card.classList.remove('active');
        }
    });
    
    // Optional: If you want clicking the whole card area to hide the image
    card.addEventListener('click', () => {
         if (card.classList.contains('active')) {
             card.classList.remove('active');
         }
    });

});













// --- RESTAURANT IN-PLACE ZOOM SCRIPT ---
const zoomCards = document.querySelectorAll('.dining-zoom-card');

zoomCards.forEach(card => {
    const viewButton = card.querySelector('.view-content-btn');
    const imageContainer = card.querySelector('.feature-image-container');

    // Listener to SHOW IMAGE (Zoom In) when the button is clicked
    if (viewButton) {
        viewButton.addEventListener('click', (e) => {
            // Prevent link navigation and click from bubbling to the card
            e.preventDefault(); 
            e.stopPropagation(); 
            
            // Only zoom in if it's not already active
            if (!card.classList.contains('active')) {
                card.classList.add('active');
            }
        });
    }

    // Listener to HIDE IMAGE (Zoom Out) when the zoomed image area is clicked
    // We attach the listener to the image container after the zoom, 
    // or simply attach it to the whole card element to toggle.
    card.addEventListener('click', (e) => {
         // Only toggle if the target isn't the button (which is handled above)
         if (!e.target.closest('.view-content-btn')) {
             card.classList.toggle('active');
         }
    });

});
