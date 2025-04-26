<template>
  <v-dialog v-model="show" max-width="800px" persistent @click:outside="closeDialog">
    <v-card class="pa-4" style="background-color: #fff6f6">
      <v-card-title class="text-center dialog-title" style="color: #5c8984">
        <v-icon large color="#5c8984" class="mr-2">mdi-file-account</v-icon>
        Job Application Form
        <v-btn icon class="close-btn ml-auto" @click="closeDialog" aria-label="Close dialog">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-alert v-if="authStore.user" type="info" variant="tonal" class="mb-4">
        Applying as: <strong>{{ authStore.user.email }}</strong>
      </v-alert>

      <v-card-text>
        <v-form
          ref="form"
          v-model="valid"
          lazy-validation
          @submit.prevent="submitForm"
          :class="{ submitted: submitted }"
        >
          <v-row>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="formData.name"
                label="Full Name"
                outlined
                dense
                background-color="#EAF4FF"
                hide-details="auto"
                :rules="getValidationRules('name')"
                prepend-inner-icon="mdi-account"
                clearable
                @focus="setFieldTouched('name')"
              ></v-text-field>
            </v-col>

            <v-col cols="12" sm="6">
              <v-text-field
                v-model="formData.phone"
                label="Phone Number"
                outlined
                dense
                background-color="#EAF4FF"
                hide-details="auto"
                :rules="getValidationRules('phone')"
                prepend-inner-icon="mdi-phone"
                clearable
                @focus="setFieldTouched('phone')"
              ></v-text-field>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12">
              <v-select
                v-model="selectedFields"
                :items="fieldOptions"
                item-title="name"
                item-value="id"
                label="Select Position(s) You're Applying For"
                outlined
                dense
                chips
                multiple
                background-color="#EAF4FF"
                hide-details="auto"
                :rules="getValidationRules('fields')"
                :loading="loadingFields"
                no-data-text="Loading available positions..."
                prepend-inner-icon="mdi-briefcase-search"
                item-props
                @focus="setFieldTouched('fields')"
              >
                <template v-slot:chip="{ item }">
                  <v-chip color="#5c8984" text-color="white">
                    {{ item.title }}
                  </v-chip>
                </template>
              </v-select>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="formData.facebookLink"
                label="Social Media Profile"
                outlined
                dense
                background-color="#EAF4FF"
                hide-details="auto"
                :rules="getValidationRules('facebookLink')"
                placeholder="https://www.facebook.com/yourprofile"
                prepend-inner-icon="mdi-facebook"
                clearable
                hint="Please provide a link where we can learn more about you"
                persistent-hint
                @focus="setFieldTouched('facebookLink')"
              ></v-text-field>
            </v-col>

            <v-col cols="12" sm="6">
              <v-file-input
                v-model="formData.cv"
                label="Upload Your CV"
                outlined
                dense
                background-color="#EAF4FF"
                append-inner-icon="mdi-paperclip"
                hide-details="auto"
                prepend-icon=""
                :rules="getValidationRules('cv')"
                accept=".pdf,.doc,.docx"
                show-size
                counter
                hint="PDF or Word documents (max 5MB)"
                persistent-hint
                @update:modelValue="handleFileUpload"
                @click="setFieldTouched('cv')"
              ></v-file-input>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12">
              <v-textarea
                v-model="formData.reason"
                label="Cover Letter"
                outlined
                background-color="#EAF4FF"
                hide-details="auto"
                rows="6"
                :rules="getValidationRules('reason')"
                placeholder="Tell us about your skills, experience, and why you're the perfect candidate..."
                prepend-inner-icon="mdi-text-box"
                no-resize
                counter="1000"
                hint="Minimum 100 characters, maximum 1000 characters"
                persistent-hint
                @focus="setFieldTouched('reason')"
              ></v-textarea>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12">
              <v-checkbox
                v-model="formData.agreeTerms"
                :rules="getValidationRules('agreeTerms')"
                label="I confirm that the information provided is accurate and complete"
                hide-details="auto"
                color="#FF0000"
                @click="setFieldTouched('agreeTerms')"
              ></v-checkbox>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-card-actions class="justify-center pa-4">
        <v-btn
          class="send-btn mr-2"
          rounded
          @click="submitForm"
          :loading="loading"
          :disabled="loading"
          size="large"
        >
          <v-icon class="mr-4" left>mdi-send</v-icon>
          {{ authChecking ? 'Checking session...' : 'Submit Application' }}
        </v-btn>

        <v-btn
          class="reset-btn"
          rounded
          @click="resetFormWithNotification"
          :disabled="loading"
          size="large"
        >
          <v-icon class="mr-4" left>mdi-autorenew</v-icon>
          Reset Form
        </v-btn>

        <!-- <v-btn
          class="cancel-btn ml-4"
          rounded
          @click="closeDialog"
          :disabled="loading"
          size="large"
        >
          <v-icon left>mdi-close</v-icon>
          Close
        </v-btn> -->
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
        
  <script lang="ts">
import { defineComponent, ref, reactive, onMounted, watch } from 'vue'
import { VForm } from 'vuetify/components'
import { useAuthStore } from '../store/auth.ts'
import { toast } from 'vue3-toastify'

interface FormData {
  name: string
  phone: string
  facebookLink: string
  cv: File[] | null
  reason: string
  agreeTerms: boolean
}

interface Field {
  id: number
  name: string
}

export default defineComponent({
  name: 'JobApplicationForm',
  props: {
    show: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['close-dialog'],
  setup(props, { emit }) {
    const form = ref<VForm | null>(null)
    const valid = ref(false)
    const loading = ref(false)
    const authChecking = ref(false)
    const loadingFields = ref(false)
    const authStore = useAuthStore()
    const submitted = ref(false)

    // Track which fields have been touched
    const touched = reactive({
      name: false,
      phone: false,
      fields: false,
      facebookLink: false,
      cv: false,
      reason: false,
      agreeTerms: false,
    })

    const formData = reactive<FormData>({
      name: '',
      phone: '',
      facebookLink: '',
      cv: null,
      reason: '',
      agreeTerms: false,
    })

    // Enhanced validation rules
    const nameRules = [
      (v: string) => !!v || 'Name is required',
      (v: string) => (v && v.length >= 2) || 'Name must be at least 2 characters',
      (v: string) => (v && v.length <= 100) || 'Name must be less than 100 characters',
    ]

    const phoneRules = [
      (v: string) => !!v || 'Phone number is required',
      (v: string) =>
        /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(v) ||
        'Enter a valid phone number',
    ]

    const facebookRules = [
      (v: string) => !!v || 'Social media profile is required',
      (v: string) =>
        /^(https?:\/\/)?(www\.)?(facebook|linkedin|twitter)\.com\/[a-zA-Z0-9_.-]+\/?$/.test(v) ||
        'Please enter a valid profile URL (Facebook, LinkedIn, or Twitter)',
    ]

    const cvRules = [
      (v: any) => {
        if (!touched.cv && !submitted.value) return true

        if (!v || (Array.isArray(v) && v.length === 0)) {
          return 'CV is required'
        }

        const file = Array.isArray(v) ? v[0] : v
        if (!file) {
          return 'CV is required'
        }

        const fileType = file.type || ''
        const isPDF = fileType.includes('pdf') || file.name.toLowerCase().endsWith('.pdf')
        const isWord =
          fileType.includes('msword') ||
          fileType.includes('wordprocessingml') ||
          file.name.toLowerCase().endsWith('.doc') ||
          file.name.toLowerCase().endsWith('.docx')

        if (!isPDF && !isWord) {
          return 'Only PDF or Word files are allowed'
        }

        if (file.size > 5000000) {
          return 'File size should be less than 5MB'
        }

        return true
      },
    ]

    const fieldRules = [
      (v: number[]) => (!!v && v.length > 0) || 'At least one position is required',
      (v: number[]) => (v && v.length <= 3) || 'You can select up to 3 positions',
    ]

    const reasonRules = [
      (v: string) => !!v || 'Cover letter is required',
      (v: string) => (v && v.length >= 100) || 'Please write at least 100 characters',
      (v: string) => (v && v.length <= 1000) || 'Maximum 1000 characters allowed',
    ]

    const agreeTermsRules = [(v: boolean) => !!v || 'You must agree to continue']

    const selectedFields = ref<number[]>([])
    const fieldOptions = ref<Field[]>([])

    // Function to get validation rules based on whether field has been touched
    const getValidationRules = (fieldName: string) => {
      if (!touched[fieldName as keyof typeof touched] && !submitted.value) {
        return [() => true] // Return a rule that always passes if field not touched
      }

      switch (fieldName) {
        case 'name':
          return nameRules
        case 'phone':
          return phoneRules
        case 'fields':
          return fieldRules
        case 'facebookLink':
          return facebookRules
        case 'cv':
          return cvRules
        case 'reason':
          return reasonRules
        case 'agreeTerms':
          return agreeTermsRules
        default:
          return [() => true]
      }
    }

    // Set field as touched
    const setFieldTouched = (fieldName: string) => {
      touched[fieldName as keyof typeof touched] = true
    }

    const fetchFields = async () => {
      loadingFields.value = true
      try {
        const response = await fetch('http://localhost:3000/api/fields', {
          headers: {
            Authorization: `Bearer ${authStore.token}`,
          },
        })

        if (!response.ok) {
          throw new Error('Failed to fetch available positions')
        }

        fieldOptions.value = await response.json()
      } catch (error) {
        toast.error('Failed to load available positions. Please try again later.', {
          position: toast.POSITION.TOP_RIGHT,
        })
      } finally {
        loadingFields.value = false
      }
    }

    onMounted(() => {
      fetchFields()
    })

    watch(
      () => formData.phone,
      (newVal) => {
        if (newVal) {
          formData.phone = newVal.replace(/[^\d+]/g, '')
        }
      }
    )

    watch(
      () => localStorage.getItem('authToken'),
      (newToken) => {
        if (!newToken) {
          toast.warning('You need to login to submit applications')
        }
      }
    )

    watch(
      () => props.show,
      (newVal) => {
        if (newVal) {
          resetForm(false)
        }
      }
    )

    watch(
      () => props.show,
      (newVal) => {
        if (newVal) {
          authStore.fetchUserProfile()
          if (!authStore.isLoggedIn) {
            toast.warning('Please login to submit applications')
            emit('close-dialog')
          }
        }
      }
    )

    const submitForm = async () => {
      submitted.value = true
      if (authChecking.value) return

      // Mark all fields as touched for validation
      Object.keys(touched).forEach((key) => {
        touched[key as keyof typeof touched] = true
      })

      // Need to wait a moment for validation to apply
      await new Promise((resolve) => setTimeout(resolve, 100))

      const { valid: isValid } = (await form.value?.validate()) || { valid: false }
      if (!isValid) {
        toast.warning('Please complete all required fields correctly', {
          position: toast.POSITION.TOP_RIGHT,
        })
        return
      }

      loading.value = true
      authChecking.value = true

      try {
        const token = localStorage.getItem('authToken')
        if (!token) {
          throw new Error('No authentication token found')
        }
        const formDataToSubmit = new FormData()
        formDataToSubmit.append('name', formData.name.trim())
        formDataToSubmit.append('phone', formData.phone.trim())
        formDataToSubmit.append('facebook', formData.facebookLink.trim())
        selectedFields.value.forEach((fieldId) => {
          formDataToSubmit.append('fieldIds', fieldId.toString())
        })
        formDataToSubmit.append('description', formData.reason.trim())

        if (formData.cv && formData.cv.length > 0) {
          formDataToSubmit.append('cv', formData.cv[0])
        }

        const headers = {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        }
        const response = await fetch('http://localhost:3000/api/applications', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formDataToSubmit,
        })
        const responseData = await response.json()
        if (!response.ok) {
          throw new Error(responseData.message || 'Failed to submit application')
        }

        toast.success(
          'Your application has been successfully submitted! We will review your information and contact you soon.',
          {
            position: toast.POSITION.TOP_RIGHT,
            autoClose: 6000,
          }
        )

        // Reset form without notification and close dialog
        resetForm(false)
        emit('close-dialog')
      } catch (error) {
        if (error instanceof Error && error.message.includes('401')) {
          authStore.logout()
          toast.error('Session expired. Please login again.')
        } else {
          const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
          toast.error(`Submission failed: ${errorMessage}. Please try again.`, {
            position: toast.POSITION.TOP_RIGHT,
            autoClose: 5000,
          })
        }
      } finally {
        loading.value = false
        authChecking.value = false
      }
    }

    const handleFileUpload = (files: any) => {
      formData.cv = Array.isArray(files) ? files : [files]
      touched.cv = true
    }

    // Reset form without notification (default behavior)
    const resetForm = (showNotification = false) => {
      submitted.value = false

      // Reset form data
      formData.name = ''
      formData.phone = ''
      formData.facebookLink = ''
      formData.cv = null
      formData.reason = ''
      formData.agreeTerms = false
      selectedFields.value = []

      // Reset touched states
      Object.keys(touched).forEach((key) => {
        touched[key as keyof typeof touched] = false
      })

      // Reset Vuetify form validation
      if (form.value) {
        form.value.resetValidation()
      }

      // Only show notification if explicitly requested
      if (showNotification) {
        toast.info('Form has been reset', {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 2000,
        })
      }
    }

    // Reset form with notification - used by reset button
    const resetFormWithNotification = () => {
      resetForm(true)
    }

    const closeDialog = () => {
      if (loading.value) return

      if (
        formData.name ||
        formData.phone ||
        formData.facebookLink ||
        formData.cv ||
        formData.reason
      ) {
        toast.warning('You have unsaved changes. Are you sure you want to leave?', {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: false,
          closeButton: true,
          onClick: () => {
            emit('close-dialog')
            resetForm(false)
          },
        })
      } else {
        emit('close-dialog')
        resetForm(false)
      }
    }

    return {
      form,
      valid,
      formData,
      fieldOptions,
      selectedFields,
      loading,
      loadingFields,
      nameRules,
      phoneRules,
      facebookRules,
      cvRules,
      fieldRules,
      reasonRules,
      authStore,
      submitForm,
      resetForm,
      resetFormWithNotification,
      closeDialog,
      handleFileUpload,
      submitted,
      touched,
      authChecking,
      getValidationRules,
      setFieldTouched,
    }
  },
})
</script>
        
  <style scoped>
.dialog-title {
  font-family: 'Baloo 2', cursive;
  font-weight: 900;
  font-size: 28px;
  color: #5c8984;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn {
  background-color: white;
  border-radius: 100%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.close-btn:hover {
  transform: rotate(90deg);
}

.send-btn {
  background-color: #5c8984;
  color: white;
  font-weight: 700;
  font-size: 16px;
  padding: 12px 32px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  min-width: 200px;
}

.send-btn:hover:not(:disabled) {
  background-color: #699e95;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.send-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
  opacity: 0.7;
}

.reset-btn {
  background-color: #f5f5f5;
  color: #666;
  font-weight: 600;
  font-size: 16px;
  padding: 12px 32px;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  min-width: 180px;
}

.reset-btn:hover:not(:disabled) {
  background-color: #e0e0e0;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.cancel-btn {
  background-color: #ffe6e6;
  color: #d32f2f;
  font-weight: 600;
  font-size: 16px;
  padding: 12px 32px;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  min-width: 150px;
}

.cancel-btn:hover:not(:disabled) {
  background-color: #ffcccc;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.v-card {
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  overflow: hidden;
}

.v-text-field ::v-deep(.v-input__prepend-inner),
.v-textarea ::v-deep(.v-input__prepend-inner),
.v-select ::v-deep(.v-input__prepend-inner) {
  margin-right: 12px;
  color: #5c8984;
}

.v-chip {
  margin: 2px;
}
.v-input__error-message {
  opacity: 0;
  transition: opacity 0.3s;
}

.v-input--error.v-input--is-dirty .v-input__error-message {
  opacity: 1;
}
</style>