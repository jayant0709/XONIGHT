// Checkout Automation Utility
// This utility provides automated form filling functionality for the checkout process

interface AddressData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

// Sample user data - in a real app, this would come from user profile or be customizable
const sampleUserData: AddressData = {
  fullName: "John Smith",
  email: "john.smith@example.com",
  phone: "+1 (555) 123-4567",
  address: "123 Main Street, Apt 4B",
  city: "New York",
  state: "NY",
  zipCode: "10001",
  country: "United States"
};

// Typing animation configuration
const TYPING_SPEED = 50; // milliseconds between characters
const FIELD_DELAY = 500; // milliseconds to wait between fields

// Simulate typing in a text input with realistic timing
const simulateTyping = async (
  setValue: (value: string) => void,
  text: string,
  speed: number = TYPING_SPEED
): Promise<void> => {
  return new Promise((resolve) => {
    let currentIndex = 0;
    
    const typeCharacter = () => {
      if (currentIndex <= text.length) {
        setValue(text.substring(0, currentIndex));
        currentIndex++;
        
        if (currentIndex <= text.length) {
          // Add some randomness to typing speed for more realistic effect
          const randomDelay = speed + Math.random() * 30 - 15;
          setTimeout(typeCharacter, Math.max(20, randomDelay));
        } else {
          resolve();
        }
      }
    };
    
    typeCharacter();
  });
};

// Wait for a specified amount of time
const wait = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Main automation function
export const automateCheckoutForm = async (
  formSetters: {
    setFullName: (value: string) => void;
    setEmail: (value: string) => void;
    setPhone: (value: string) => void;
    setAddress: (value: string) => void;
    setCity: (value: string) => void;
    setState: (value: string) => void;
    setZipCode: (value: string) => void;
    setCountry: (value: string) => void;
  },
  fieldRefs?: {
    fullNameRef?: React.RefObject<any>;
    emailRef?: React.RefObject<any>;
    phoneRef?: React.RefObject<any>;
    addressRef?: React.RefObject<any>;
    cityRef?: React.RefObject<any>;
    stateRef?: React.RefObject<any>;
    pincodeRef?: React.RefObject<any>;
    landmarkRef?: React.RefObject<any>;
  },
  scrollViewRef?: React.RefObject<any>,
  onComplete?: () => void,
  onProgress?: (field: string, progress: number) => void
): Promise<void> => {
  const fields = [
    { 
      name: 'Full Name', 
      setter: formSetters.setFullName, 
      value: sampleUserData.fullName,
      ref: fieldRefs?.fullNameRef
    },
    { 
      name: 'Phone', 
      setter: formSetters.setPhone, 
      value: sampleUserData.phone,
      ref: fieldRefs?.phoneRef
    },
    { 
      name: 'Email', 
      setter: formSetters.setEmail, 
      value: sampleUserData.email,
      ref: fieldRefs?.emailRef
    },
    { 
      name: 'Address', 
      setter: formSetters.setAddress, 
      value: sampleUserData.address,
      ref: fieldRefs?.addressRef
    },
    { 
      name: 'City', 
      setter: formSetters.setCity, 
      value: sampleUserData.city,
      ref: fieldRefs?.cityRef
    },
    { 
      name: 'State', 
      setter: formSetters.setState, 
      value: sampleUserData.state,
      ref: fieldRefs?.stateRef
    },
    { 
      name: 'ZIP Code', 
      setter: formSetters.setZipCode, 
      value: sampleUserData.zipCode,
      ref: fieldRefs?.pincodeRef
    },
  ];

  try {
    for (let i = 0; i < fields.length; i++) {
      const field = fields[i];
      
      // Report progress
      if (onProgress) {
        onProgress(field.name, (i / fields.length) * 100);
      }
      
      // Scroll to field without focusing (no keyboard)
      if (field.ref?.current && scrollViewRef?.current) {
        // Measure field position and scroll to it
        field.ref.current.measureLayout(
          scrollViewRef.current,
          (x: number, y: number) => {
            scrollViewRef.current?.scrollTo({ 
              y: Math.max(0, y - 100), // Offset to show field nicely
              animated: true 
            });
          },
          () => {} // Error callback
        );
        
        await wait(800); // Wait for scroll animation
      }
      
      // Clear field first
      field.setter('');
      await wait(200);
      
      // Type the value (no keyboard interaction)
      await simulateTyping(field.setter, field.value);
      
      // Wait before moving to next field
      await wait(FIELD_DELAY);
    }
    
    // Final progress update
    if (onProgress) {
      onProgress('Complete', 100);
    }
    
    // Wait a bit before calling completion callback
    await wait(1000);
    
    if (onComplete) {
      onComplete();
    }
    
  } catch (error) {
    console.error('Checkout automation failed:', error);
    throw error;
  }
};

// Export the sample data and constants for use in other components
export { sampleUserData, TYPING_SPEED, FIELD_DELAY };

// Progress tracking interface
export interface AutomationProgress {
  currentField: string;
  progress: number;
  isComplete: boolean;
}

// Create a progress tracker
export const createProgressTracker = (
  onUpdate: (progress: AutomationProgress) => void
) => {
  return {
    updateProgress: (field: string, progress: number) => {
      onUpdate({
        currentField: field,
        progress,
        isComplete: progress >= 100
      });
    }
  };
};