// Feature-specific functionality goes here.
    const datePicker = document.getElementById('date-picker');
    const slotsContainer = document.getElementById('slots-container');
    const confirmBtn = document.getElementById('confirm-btn');
    const statusMessage = document.getElementById('status-message');

    // Standard available time slots
    const availableTimes = [
      '09:00 AM', '10:00 AM', '11:00 AM',
      '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'
    ];

    // Simulated already-booked slots (Date -> Array of times)
    const bookedSlots = {};

    let selectedTime = null;

    // Set default and minimum selectable date to today
    const today = new Date().toISOString().split('T')[0];
    datePicker.min = today;
    datePicker.value = today;

    function renderTimeSlots(date) {
      slotsContainer.innerHTML = '';
      selectedTime = null;
      confirmBtn.disabled = true;

      const unavailableForDate = bookedSlots[date] || [];

      availableTimes.forEach(time => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'slot-btn';
        btn.textContent = time;

        // Disable button if the slot is already booked
        if (unavailableForDate.includes(time)) {
          btn.disabled = true;
        }

        btn.addEventListener('click', () => {
          document.querySelectorAll('.slot-btn').forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
          selectedTime = time;
          confirmBtn.disabled = false;
          statusMessage.style.display = 'none';
        });

        slotsContainer.appendChild(btn);
      });
    }

    // Re-render slots when the user changes the date
    datePicker.addEventListener('change', (e) => {
      statusMessage.style.display = 'none';
      renderTimeSlots(e.target.value);
    });

    // Handle booking confirmation
    confirmBtn.addEventListener('click', () => {
      const selectedDate = datePicker.value;
      if (!selectedDate || !selectedTime) return;

      // Save the booking to our local state so it becomes disabled
      if (!bookedSlots[selectedDate]) {
        bookedSlots[selectedDate] = [];
      }
      bookedSlots[selectedDate].push(selectedTime);

      statusMessage.textContent = `Confirmed! Your appointment is set for ${selectedDate} at ${selectedTime}.`;
      statusMessage.style.display = 'block';

      // Refresh the grid to show the newly booked slot as unavailable
      renderTimeSlots(selectedDate);
    });

    // Initial render for today's date
    renderTimeSlots(today);