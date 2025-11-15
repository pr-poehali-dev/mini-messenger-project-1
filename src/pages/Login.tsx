import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

declare global {
  interface Window {
    TelegramLoginWidget: {
      dataOnauth: (user: TelegramUser) => void;
    };
  }
}

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

function Login() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const existingUser = localStorage.getItem('telegramUser');
    if (existingUser) {
      navigate('/');
    }

    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.setAttribute('data-telegram-login', 'YOUR_BOT_USERNAME');
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-radius', '8');
    script.setAttribute('data-onauth', 'TelegramLoginWidget.dataOnauth(user)');
    script.setAttribute('data-request-access', 'write');
    script.async = true;

    const widgetContainer = document.getElementById('telegram-login-container');
    if (widgetContainer) {
      widgetContainer.appendChild(script);
    }

    window.TelegramLoginWidget = {
      dataOnauth: (user: TelegramUser) => {
        handleTelegramAuth(user);
      }
    };

    return () => {
      if (widgetContainer && script.parentNode === widgetContainer) {
        widgetContainer.removeChild(script);
      }
    };
  }, [navigate]);

  const handleTelegramAuth = (user: TelegramUser) => {
    setIsLoading(true);
    
    localStorage.setItem('telegramUser', JSON.stringify(user));
    
    setTimeout(() => {
      navigate('/');
    }, 1000);
  };

  const handleDemoLogin = () => {
    const demoUser: TelegramUser = {
      id: 123456789,
      first_name: 'Демо',
      last_name: 'Пользователь',
      username: 'demo_user',
      photo_url: '',
      auth_date: Date.now(),
      hash: 'demo_hash'
    };
    
    handleTelegramAuth(demoUser);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/10">
      <div className="w-full max-w-md p-8">
        <div className="bg-card border border-border rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-primary rounded-full mx-auto mb-4 flex items-center justify-center">
              <Icon name="MessageSquare" size={40} className="text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Добро пожаловать</h1>
            <p className="text-muted-foreground">
              Войдите через Telegram, чтобы начать общение
            </p>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
              <p className="text-muted-foreground">Вход в систему...</p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <div id="telegram-login-container" className="flex justify-center"></div>
              </div>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-card text-muted-foreground">или</span>
                </div>
              </div>

              <Button
                onClick={handleDemoLogin}
                variant="outline"
                className="w-full"
              >
                <Icon name="UserCircle" size={20} className="mr-2" />
                Демо-вход (для теста)
              </Button>

              <div className="mt-8 pt-6 border-t border-border">
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <Icon name="Shield" size={16} className="mt-0.5 flex-shrink-0" />
                    <p>Безопасная авторизация через Telegram</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Icon name="Lock" size={16} className="mt-0.5 flex-shrink-0" />
                    <p>Ваши данные защищены и не передаются третьим лицам</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Icon name="Zap" size={16} className="mt-0.5 flex-shrink-0" />
                    <p>Мгновенный вход без регистрации</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Нажимая "Войти", вы принимаете условия использования
        </p>
      </div>
    </div>
  );
}

export default Login;
