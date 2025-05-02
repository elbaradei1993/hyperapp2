
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Define available languages
export type LanguageType = 'en' | 'es' | 'fr' | 'ar';

// Define translations structure
export type TranslationsType = {
  [key: string]: {
    [key in LanguageType]?: string;
  };
};

// Common translations across the app
export const commonTranslations: TranslationsType = {
  welcome: {
    en: 'Welcome',
    es: 'Bienvenido',
    fr: 'Bienvenue',
    ar: 'مرحبا'
  },
  signIn: {
    en: 'Sign In',
    es: 'Iniciar Sesión',
    fr: 'Se Connecter',
    ar: 'تسجيل الدخول'
  },
  register: {
    en: 'Register',
    es: 'Registrarse',
    fr: 'S\'inscrire',
    ar: 'تسجيل'
  },
  email: {
    en: 'Email',
    es: 'Correo electrónico',
    fr: 'E-mail',
    ar: 'البريد الإلكتروني'
  },
  password: {
    en: 'Password',
    es: 'Contraseña',
    fr: 'Mot de passe',
    ar: 'كلمة المرور'
  },
  username: {
    en: 'Username',
    es: 'Nombre de usuario',
    fr: 'Nom d\'utilisateur',
    ar: 'اسم المستخدم'
  },
  name: {
    en: 'Name',
    es: 'Nombre',
    fr: 'Nom',
    ar: 'اسم'
  },
  map: {
    en: 'Map',
    es: 'Mapa',
    fr: 'Carte',
    ar: 'خريطة'
  },
  vibes: {
    en: 'Vibes',
    es: 'Vibraciones',
    fr: 'Ambiances',
    ar: 'الأجواء'
  },
  events: {
    en: 'Events',
    es: 'Eventos',
    fr: 'Événements',
    ar: 'أحداث'
  },
  alerts: {
    en: 'Alerts',
    es: 'Alertas',
    fr: 'Alertes',
    ar: 'تنبيهات'
  },
  profile: {
    en: 'Profile',
    es: 'Perfil',
    fr: 'Profil',
    ar: 'الملف الشخصي'
  },
  settings: {
    en: 'Settings',
    es: 'Configuración',
    fr: 'Paramètres',
    ar: 'الإعدادات'
  },
  save: {
    en: 'Save',
    es: 'Guardar',
    fr: 'Enregistrer',
    ar: 'حفظ'
  },
  cancel: {
    en: 'Cancel',
    es: 'Cancelar',
    fr: 'Annuler',
    ar: 'إلغاء'
  },
  loading: {
    en: 'Loading...',
    es: 'Cargando...',
    fr: 'Chargement...',
    ar: 'تحميل...'
  },
  error: {
    en: 'Error',
    es: 'Error',
    fr: 'Erreur',
    ar: 'خطأ'
  },
  submit: {
    en: 'Submit',
    es: 'Enviar',
    fr: 'Soumettre',
    ar: 'إرسال'
  },
  createEvent: {
    en: 'Create Event',
    es: 'Crear Evento',
    fr: 'Créer un Événement',
    ar: 'إنشاء حدث'
  },
  eventTitle: {
    en: 'Event Title',
    es: 'Título del Evento',
    fr: 'Titre de l\'Événement',
    ar: 'عنوان الحدث'
  },
  eventDescription: {
    en: 'Event Description',
    es: 'Descripción del Evento',
    fr: 'Description de l\'Événement',
    ar: 'وصف الحدث'
  },
  eventLocation: {
    en: 'Event Location',
    es: 'Ubicación del Evento',
    fr: 'Lieu de l\'Événement',
    ar: 'موقع الحدث'
  },
  startDate: {
    en: 'Start Date',
    es: 'Fecha de Inicio',
    fr: 'Date de Début',
    ar: 'تاريخ البدء'
  },
  endDate: {
    en: 'End Date',
    es: 'Fecha de Finalización',
    fr: 'Date de Fin',
    ar: 'تاريخ الانتهاء'
  },
  maxAttendees: {
    en: 'Max Attendees',
    es: 'Asistentes Máximos',
    fr: 'Participants Maximum',
    ar: 'الحد الأقصى للحضور'
  },
  isPublic: {
    en: 'Public Event',
    es: 'Evento Público',
    fr: 'Événement Public',
    ar: 'حدث عام'
  },
  uploadImage: {
    en: 'Upload Image',
    es: 'Subir Imagen',
    fr: 'Télécharger une Image',
    ar: 'تحميل صورة'
  },
  required: {
    en: 'Required',
    es: 'Requerido',
    fr: 'Requis',
    ar: 'مطلوب'
  },
  optional: {
    en: 'Optional',
    es: 'Opcional',
    fr: 'Facultatif',
    ar: 'اختياري'
  }
};

// Interface for the language context
interface LanguageContextProps {
  language: LanguageType;
  setLanguage: (language: LanguageType) => void;
  t: (key: string) => string;
}

// Create the context
const LanguageContext = createContext<LanguageContextProps>({
  language: 'en',
  setLanguage: () => {},
  t: () => ''
});

// Create language provider
interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageType>('en');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch language setting from local storage or Supabase
  useEffect(() => {
    const fetchLanguageSetting = async () => {
      try {
        // Try to get from local storage first
        const storedSettings = localStorage.getItem('user_settings');
        if (storedSettings) {
          const parsedSettings = JSON.parse(storedSettings);
          if (parsedSettings.language) {
            setLanguageState(parsedSettings.language as LanguageType);
            document.documentElement.dir = parsedSettings.language === "ar" ? "rtl" : "ltr";
            return;
          }
        }

        // If not in local storage, try to get from Supabase if user is logged in
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data } = await supabase
            .from('profiles')
            .select('settings')
            .eq('id', session.user.id)
            .single();

          if (data?.settings?.language) {
            setLanguageState(data.settings.language as LanguageType);
            document.documentElement.dir = data.settings.language === "ar" ? "rtl" : "ltr";
          }
        }
      } catch (error) {
        console.error('Error fetching language setting:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLanguageSetting();
  }, []);

  // Set language and update storage
  const setLanguage = async (newLanguage: LanguageType) => {
    setLanguageState(newLanguage);
    document.documentElement.dir = newLanguage === "ar" ? "rtl" : "ltr";
    
    try {
      // Update localStorage
      const storedSettings = localStorage.getItem('user_settings');
      const parsedSettings = storedSettings ? JSON.parse(storedSettings) : {};
      parsedSettings.language = newLanguage;
      localStorage.setItem('user_settings', JSON.stringify(parsedSettings));
      
      // Update Supabase if user is logged in
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data } = await supabase
          .from('profiles')
          .select('settings')
          .eq('id', session.user.id)
          .single();
        
        const updatedSettings = { 
          ...(data?.settings || {}), 
          language: newLanguage 
        };
        
        await supabase
          .from('profiles')
          .update({ settings: updatedSettings })
          .eq('id', session.user.id);
      }
    } catch (error) {
      console.error('Error updating language setting:', error);
    }
  };

  // Translate function
  const t = (key: string): string => {
    if (!commonTranslations[key]) {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }
    return commonTranslations[key][language] || commonTranslations[key].en || key;
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Create a hook for using the language context
export const useLanguage = () => useContext(LanguageContext);
