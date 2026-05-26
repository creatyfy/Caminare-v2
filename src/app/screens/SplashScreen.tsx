import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { getProfile } from '../lib/db';

export function SplashScreen() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { session, loading, user } = useAuth();
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [adminChecked, setAdminChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Tempos: 0 = entrada animada, 1 = hold mostrando a logo, 2 = saída e navega
  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 1600);
    const t2 = setTimeout(() => setStep(2), 2300);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  // Verifica se o usuário logado é admin (pra rotear pro painel direto)
  useEffect(() => {
    if (loading) return;
    if (!user) {
      setAdminChecked(true);
      return;
    }
    let active = true;
    getProfile(user.id).then((p) => {
      if (!active) return;
      setIsAdmin(!!p?.is_admin);
      setAdminChecked(true);
    });
    return () => {
      active = false;
    };
  }, [loading, user]);

  useEffect(() => {
    if (step === 2 && !loading && adminChecked) {
      if (!session) navigate('/login', { replace: true });
      else if (isAdmin) navigate('/admin', { replace: true });
      else navigate('/home', { replace: true });
    }
  }, [step, loading, session, adminChecked, isAdmin, navigate]);

  const exiting = step >= 2;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: 'var(--cam-bg-page)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <AnimatePresence>
        {!exiting && (
          <motion.div
            key="splash-logo"
            initial={{ opacity: 0, scale: 0.78 }}
            animate={{
              opacity: 1,
              scale: [0.82, 1.06, 0.99, 1.02, 1],
            }}
            exit={{
              opacity: 0,
              scale: 0.94,
              transition: { duration: 0.45, ease: 'easeOut' },
            }}
            transition={{
              opacity: { duration: 0.55, ease: 'easeOut' },
              scale: {
                duration: 1.8,
                times: [0, 0.3, 0.55, 0.8, 1],
                ease: 'easeInOut',
              },
            }}
            style={{ display: 'flex' }}
          >
            <img
              src="/logoatualizado.png"
              alt="Caminare"
              style={{
                width: 260,
                maxWidth: '70vw',
                height: 'auto',
                objectFit: 'contain',
                display: 'block',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: step >= 1 && !exiting ? 0.6 : 0 }}
        transition={{ duration: 0.5 }}
        style={{
          position: 'absolute',
          bottom: 40,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontSize: 13,
          fontWeight: 500,
          color: 'var(--cam-text-brand)',
        }}
      >
        {t('splash.tagline')}
      </motion.div>
    </div>
  );
}
