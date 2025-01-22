document.addEventListener('DOMContentLoaded', () => {
  initializeForm();
});

function initializeForm() {
  const form = document.getElementById('event-form');
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        const formData = new FormData(form);
        const response = await submitEvent(formData);
        
        if (response.success) {
          showSuccess('Etkinliğiniz başarıyla gönderildi. Onay sürecinden sonra yayınlanacaktır.');
          form.reset();
        } else {
          showError('Bir hata oluştu. Lütfen tekrar deneyin.');
        }
      } catch (error) {
        console.error('Error submitting event:', error);
        showError('Bir hata oluştu. Lütfen tekrar deneyin.');
      }
    }
  });

  // Date input validations
  const startDate = document.getElementById('startDate');
  const endDate = document.getElementById('endDate');
  const deadline = document.getElementById('deadline');

  startDate.addEventListener('change', () => {
    endDate.min = startDate.value;
    deadline.max = startDate.value;
  });

  // File input preview
  const imageInput = document.getElementById('image');
  imageInput.addEventListener('change', previewImage);
}

function validateForm() {
  const required = document.querySelectorAll('[required]');
  let isValid = true;

  required.forEach(field => {
    if (!field.value) {
      isValid = false;
      field.classList.add('error');
    } else {
      field.classList.remove('error');
    }
  });

  if (!isValid) {
    showError('Lütfen tüm zorunlu alanları doldurun.');
  }

  return isValid;
}

function previewImage(e) {
  const file = e.target.files[0];
  if (file) {
    if (file.size > 5000000) { // 5MB limit
      showError('Dosya boyutu 5MB\'dın küçük olmalıdır.');
      e.target.value = '';
      return;
    }

    if (!file.type.startsWith('image/')) {
      showError('Lütfen geçerli bir görsel dosyası yükleyin.');
      e.target.value = '';
      return;
    }
  }
}

async function submitEvent(formData) {
  try {
    const response = await fetch(`${API_BASE_URL}/events`, {
      method: 'POST',
      body: formData
    });
    return await response.json();
  } catch (error) {
    console.error('Error submitting event:', error);
    throw error;
  }
}

function showSuccess(message) {
  // Implement success notification
  alert(message);
}

function showError(message) {
  // Implement error notification
  alert(message);
}