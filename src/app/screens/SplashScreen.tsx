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
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0);
  const [adminChecked, setAdminChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 900);
    const t2 = setTimeout(() => setStep(2), 1900);
    const t3 = setTimeout(() => setStep(3), 3100);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
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
    if (step === 3 && !loading && adminChecked) {
      if (!session) navigate('/login', { replace: true });
      else if (isAdmin) navigate('/admin', { replace: true });
      else navigate('/home', { replace: true });
    }
  }, [step, loading, session, adminChecked, isAdmin, navigate]);

  const owlVisible = step >= 0;
  const textVisible = step >= 1;
  const exiting = step >= 3;

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
            key="splash-content"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.45, ease: 'easeOut' } }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.6 }}
              animate={
                owlVisible
                  ? { opacity: 1, scale: [0.95, 1.05, 0.98, 1.04, 1] }
                  : {}
              }
              transition={{
                opacity: { duration: 0.5, ease: 'easeOut' },
                scale: {
                  duration: 2.2,
                  times: [0, 0.25, 0.5, 0.75, 1],
                  ease: 'easeInOut',
                },
              }}
              style={{ display: 'flex' }}
            >
              <img
                src="/owl_cropped.png"
                alt="Caminare"
                style={{ width: 120, height: 'auto', objectFit: 'contain' }}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 14, scale: 0.9 }}
              animate={
                textVisible
                  ? { opacity: 1, y: 0, scale: [0.95, 1.04, 1] }
                  : { opacity: 0, y: 14, scale: 0.9 }
              }
              transition={{
                opacity: { duration: 0.5, ease: 'easeOut' },
                y: { duration: 0.5, ease: 'easeOut' },
                scale: { duration: 1.6, times: [0, 0.5, 1], ease: 'easeInOut' },
              }}
              style={{ display: 'flex' }}
            >
              <img
                src="/text_cropped.png"
                alt="Caminare"
                style={{ width: 180, height: 'auto', objectFit: 'contain' }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: textVisible && !exiting ? 0.6 : 0 }}
        transition={{ duration: 0.6 }}
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
