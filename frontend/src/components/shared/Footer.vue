<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <footer class="footer">
    <div class="footer-content">
      <div class="footer-section">
        <h3 class="footer-heading">Quick Links</h3>
        <ul class="footer-links">
          <li><router-link to="/about" class="footer-link">About Us</router-link></li>
          <li><router-link to="/services" class="footer-link">Services</router-link></li>
          <li><router-link to="/contact" class="footer-link">Contact</router-link></li>
          <li><router-link to="/privacy" class="footer-link">Privacy Policy</router-link></li>
        </ul>
      </div>

      <div class="footer-section">
        <h3 class="footer-heading">Connect With Us</h3>
        <ul class="social-links">
          <li>
            <a
              href="https://www.facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              class="social-link"
            >
              <i class="icon-facebook"></i> Facebook
            </a>
          </li>
          <li>
            <a
              href="https://www.twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              class="social-link"
            >
              <i class="icon-twitter"></i> Twitter
            </a>
          </li>
          <li>
            <a
              href="https://www.linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              class="social-link"
            >
              <i class="icon-linkedin"></i> LinkedIn
            </a>
          </li>
        </ul>
      </div>

      <div class="footer-section">
        <h3 class="footer-heading">Newsletter</h3>
        <p class="newsletter-text">Subscribe to our newsletter for updates</p>
        <div class="newsletter-form">
          <input type="email" placeholder="Your email address" class="newsletter-input" />
          <button type="submit" class="newsletter-button" @click="handleSubmit">Subscribe</button>
        </div>
      </div>
    </div>

    <div class="footer-bottom">
      <p>&copy; 2025 QEL. All rights reserved.</p>
    </div>
  </footer>
</template>

<script lang="ts">
import { toast } from 'vue3-toastify'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'Footer',
  methods: {
    handleSubmit() {
      toast.success('Subscribed successfully!', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        progress: undefined,
      })
    }
  }
})
</script>

<style scoped>
.footer {
  position: fixed;
  background-color: #2c3e50;
  color: white;
  padding: 20px;
  text-align: center;
  position: relative;
  /* bottom: -100px; */
  width: 100%;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
}

.footer-left {
  font-size: 0.9rem;
}

.footer-right .social-links {
  list-style-type: none;
  display: flex;
  gap: 15px;
}

.social-link {
  color: white;
  text-decoration: none;
  font-size: 1rem;
}

.social-link:hover {
  color: #3498db;
  text-decoration: underline;
}
.footer-section {
  margin-bottom: 30px;
}

.footer-heading {
  color: #3498db;
  font-size: 1.2rem;
  margin-bottom: 20px;
  position: relative;
  padding-bottom: 10px;
}

.footer-heading::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 50px;
  height: 2px;
  background: #3498db;
}

.footer-links {
  list-style: none;
  padding: 0;
}

.footer-link {
  color: #bdc3c7;
  text-decoration: none;
  display: block;
  margin-bottom: 10px;
  transition: all 0.3s ease;
}

.footer-link:hover {
  color: #3498db;
  padding-left: 5px;
}

.social-links {
  list-style: none;
  padding: 0;
}

.social-link {
  color: #bdc3c7;
  text-decoration: none;
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  transition: all 0.3s ease;
}

.social-link:hover {
  color: #3498db;
}

.social-link i {
  margin-right: 10px;
  font-size: 1.2rem;
}

/* Icon font - you can replace with actual icon components or SVG */
.icon-facebook::before {
  content: 'f';
}
.icon-twitter::before {
  content: 't';
}
.icon-linkedin::before {
  content: 'in';
}

.newsletter-text {
  margin-bottom: 15px;
  color: #bdc3c7;
  font-size: 0.9rem;
}

.newsletter-form {
  display: flex;
}

.newsletter-input {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 4px 0 0 4px;
  font-size: 0.9rem;
}

.newsletter-button {
  background: #3498db;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 0 4px 4px 0;
  cursor: pointer;
  transition: background 0.3s ease;
}

.newsletter-button:hover {
  background: #2980b9;
}

.footer-bottom {
  text-align: center;
  padding: 20px;
  background: rgba(0, 0, 0, 0.2);
  margin-top: 30px;
  font-size: 0.9rem;
  color: #bdc3c7;
}

@media (max-width: 768px) {
  .footer-content {
    grid-template-columns: 1fr;
  }

  .newsletter-form {
    flex-direction: column;
  }

  .newsletter-input {
    border-radius: 4px;
    margin-bottom: 10px;
  }

  .newsletter-button {
    border-radius: 4px;
    width: 100%;
  }
}
</style>