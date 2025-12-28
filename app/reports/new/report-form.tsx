'use client'

import React, { useState } from 'react';
import { Send, Loader2, Eye, EyeOff, AlertTriangle, CheckCircle2, XCircle, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Типи
interface FormData {
  strikeTime: string;
  flightType: string;
  crew: string;
  pilot: string;
  droneType: string;
  serialNumber: string,
  stream: string;
  generalResult: string;
  shortDescription: string;
  targetDestroyed: string;
  lossReason: string;
  targetSettlement: string;
  targetCoordinates: string;
  eventSettlement: string;
  eventCoordinates: string;
  ammoType: string;
  initiationType: string;
  ammoCount: string;
}

interface FormFieldProps {
  label: string;
  error?: string;
  children: React.ReactNode;
  required?: boolean;
}

type ErrorsType = Partial<Record<keyof FormData, string>>;
type TouchedType = Partial<Record<keyof FormData, boolean>>;

type ToastType = 'success' | 'error' | 'warning';

interface ToastData {
  type: ToastType;
  message: string;
  show: boolean;
}

const MISSION_TYPES: string[] = [
  "Виліт з метою ураження укриття противника",
  "Виліт з метою ураження о/с противника",
  "Виліт з метою ураження артилерії противника",
  "Виліт з метою ураження військової техніки противника",
  "Виліт з метою ураження засобів та обладнання противника"
];

const CREWS: string[] = [
  "СОЙКА",
  "БІДОЛАГИ",
  "МОЛОХ",
  "РОДИЧІ"
];

const PILOTS: string[] = [
  "HUNTER",
  "MARSHALL",
  "TOURIST",
  "PUNCH",
  "СЬОГУН",
  "SAMURAI",
  "KIRA",
  "KOMA"
];

const DRONE_TYPES: string[] = [
  "Безпілотний літальний апарат \"VYRIY PRO\"",
  "БПЛА VIRIY JOHNNY PRO 10TK",
  "БпЛА  \"Vyriy OPTO 15/25 км\" з АКБ (40500)",
  "BabaBoom 10 radio",
  'БПЛА BABABOOM 16 OPTIC ДК ОВ20КМ',
  'БПЛА BABABOOM 16 OPTIC ДК ОВ25КМ',
  "БПЛА BLINK 8",
  "Безпілотний літальний апарат \"DARTS\"",
  "Баражуючий дрон \"Батон\""
];

const STREAMS: string[] = [
  "6.3 ALFA",
  "6.3 BRAVO",
  "6.3 DELTA",
  "6.3 РОНІН",
  "Власний (запис екрану)",
  "ПОКИДЬКИ",
  "WOLF'S"
];

const SETTLEMENTS: string[] = [
  "Сергіївка",
  "Удачне",
  "Новотроїцьке",
  "Жовте",
  "Котлине",
  "Покровськ",
  "Мирноград",
  "Шевченко",
];

const TARGET_TYPES: string[] = [
  "Особовий склад",
  "Автомобіль",
  "Позиція артилерії",
  "Укриття",
  "БТР",
  "БМП",
  "Танк",
  "Укріплення",
  "Склад БК",
  "Командний пункт",
  "РСЗВ",
  "ППО",
  "РЛС"
];

const AMMOS_LIST: string[] = [
  "HFB1200F",
  "HFB0500C",
  "HFB0600F",
  "HFB1055F",
  "Фугас 600",
  "Фугас 800",
  "Фугас 1100",
  "Термобар-0.8",
  "МОА Композит",
  "КУ-0.8",
  "ОФ-0.8",
  "Сфера 1.1"
];

// Компонент Toast для повідомлень
const Toast: React.FC<{ toast: ToastData; onClose: () => void }> = ({ toast, onClose }) => {
  if (!toast.show) return null;

  const styles = {
    success: {
      bg: 'bg-green-50 border-green-200',
      icon: <CheckCircle2 className="w-5 h-5 text-green-600" />,
      text: 'text-green-800'
    },
    error: {
      bg: 'bg-red-50 border-red-200',
      icon: <XCircle className="w-5 h-5 text-red-600" />,
      text: 'text-red-800'
    },
    warning: {
      bg: 'bg-yellow-50 border-yellow-200',
      icon: <AlertTriangle className="w-5 h-5 text-yellow-600" />,
      text: 'text-yellow-800'
    }
  };

  const style = styles[toast.type];

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-5 duration-300">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg ${style.bg} max-w-md`}>
        {style.icon}
        <p className={`flex-1 text-sm font-medium ${style.text}`}>{toast.message}</p>
        <button
          onClick={onClose}
          className={`p-1 rounded hover:bg-black/5 transition-colors ${style.text}`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// Компонент FormField винесений за межі основного компонента
const FormField: React.FC<FormFieldProps> = ({ label, error, children, required = true }) => (
  <div className="space-y-1.5">
    <Label className="text-sm font-medium">
      {label} {required && <span className="text-red-500">*</span>}
    </Label>
    {children}
    {error && <p className="text-xs text-red-600">{error}</p>}
  </div>
);

export default function DroneReportForm() {
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<ErrorsType>({});
  const [touched, setTouched] = useState<TouchedType>({});
  const [toast, setToast] = useState<ToastData>({ type: 'success', message: '', show: false });

  const [formData, setFormData] = useState<FormData>({
    strikeTime: '',
    flightType: '',
    crew: '',
    pilot: '',
    droneType: '',
    serialNumber: '',
    stream: '',
    generalResult: '',
    shortDescription: '',
    targetDestroyed: '',
    lossReason: 'ворожий РЕБ',
    targetSettlement: '',
    targetCoordinates: '',
    eventSettlement: '',
    eventCoordinates: '',
    ammoType: '',
    initiationType: '',
    ammoCount: '1'
  });

  // Функція для показу toast повідомлень
  const showToast = (type: ToastType, message: string) => {
    setToast({ type, message, show: true });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 5000);
  };

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'strikeTime':
        return value ? '' : "Обов'язкове поле";
      case 'flightType':
      case 'droneType':
      case 'generalResult':
      case 'crew':
      case 'pilot':
      case 'stream':
        return value ? '' : 'Оберіть значення';
      case 'shortDescription':
        return formData.generalResult === 'hit' && value.length < 10 ? 'Мін. 10 символів' : '';
      case 'targetDestroyed':
        return formData.generalResult === 'hit' && !value ? "Обов'язкове поле" : '';
      case 'lossReason':
        return formData.generalResult === 'loss' && !value ? 'Оберіть причину' : '';
      case 'targetSettlement':
      case 'eventSettlement':
        return value ? '' : 'Оберіть населений пункт';
      case 'targetCoordinates':
      case 'eventCoordinates':
        // MGRS формат: 37U CP 1234567890 (зона + квадрат + координати)
        const mgrsRegex = /^\d{1,2}[A-Z]{1,3}\s*[A-Z]{2}\s*\d{4,10}$/i;
        return mgrsRegex.test(value.replace(/\s/g, '')) ? '' : 'Формат MGRS: 37U CP 1234567890';
      case 'ammoType':
      case 'initiationType':
        return value ? '' : 'Оберіть тип';
      case 'ammoCount':
        const num = parseInt(value);
        if (isNaN(num)) return 'Введіть число';
        if (num < 1) return 'Мінімум 1';
        if (num > 10) return 'Максимум 10';
        return '';
      default:
        return '';
    }
  };

  const handleChange = (name: string, value: string): void => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (touched[name as keyof FormData]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (name: string): void => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, formData[name as keyof FormData]);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const validateForm = (): ErrorsType => {
    const newErrors: ErrorsType = {};
    const requiredFields: string[] = [
      'strikeTime', 'flightType', 'crew', 'pilot',
      'droneType', 'stream', 'generalResult', 'targetSettlement', 'targetCoordinates',
      'eventSettlement', 'eventCoordinates', 'ammoType', 'initiationType', 'ammoCount'
    ];

    requiredFields.forEach(key => {
      const error = validateField(key, formData[key as keyof FormData]);
      if (error) newErrors[key as keyof FormData] = error;
    });

    if (formData.generalResult === 'hit') {
      const hitFields: string[] = ['shortDescription', 'targetDestroyed'];
      hitFields.forEach(key => {
        const error = validateField(key, formData[key as keyof FormData]);
        if (error) newErrors[key as keyof FormData] = error;
      });
    } else if (formData.generalResult === 'loss') {
      const error = validateField('lossReason', formData.lossReason);
      if (error) newErrors.lossReason = error;
    }

    return newErrors;
  };

  const handleSubmit = async (): Promise<void> => {
    const allTouched: TouchedType = {};
    Object.keys(formData).forEach(key => {
      allTouched[key as keyof FormData] = true;
    });
    setTouched(allTouched);

    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      showToast('warning', 'Будь ласка, виправте помилки у формі');
      return;
    }

    setIsSubmitting(true);
    try {
      const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyUinXnyibaNANxHYBRQWaSvgGJymOaZO8t6Nf7PQBwOt3H5wmVEnhqTHkHoW9hdjdoZQ/exec';

      // Формуємо дату та час у форматі DD.MM.YYYY HH:MM:SS
      const now = new Date();
      const formatDateTime = (date: Date): string => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`;
      };

      // Формуємо час скиду з поточною датою
      const [hours, minutes] = formData.strikeTime.split(':');
      const strikeDate = new Date();
      strikeDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const dataToSend = {
        timestamp: formatDateTime(now),
        strikeTime: formatDateTime(strikeDate),
        flightType: formData.flightType,
        crew: formData.crew,
        pilot: formData.pilot,
        droneType: formData.droneType,
        serialNumber: formData.serialNumber || '',
        stream: formData.stream,
        shortDescription: formData.generalResult === 'hit' ? formData.shortDescription : 'Ціль не уражено. Втрата борта, через ' + formData.lossReason,
        targetDestroyed: formData.generalResult === 'hit' ? formData.targetDestroyed : 'ціль не уражено',
        isDroneLoss: formData.generalResult === 'hit' ? 'Ні' : 'Так',
        lossReason: formData.generalResult === 'loss' ? formData.lossReason : '-',
        targetSettlement: formData.targetSettlement,
        ammoType: formData.ammoType,
        initiationType: formData.initiationType,
        ammoCount: formData.ammoCount,
        targetCoordinates: formData.targetCoordinates,
        eventSettlement: formData.eventSettlement,
        eventCoordinates: formData.eventCoordinates,
      };

      console.log('Відправка даних:', dataToSend);

      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend)
      });

      showToast('success', 'Звіт успішно відправлено!');

      // Очищення форми
      setFormData({
        strikeTime: '', flightType: '', crew: '', pilot: '',
        droneType: '', stream: '', serialNumber: '', generalResult: '', shortDescription: '',
        targetDestroyed: '', lossReason: '', targetSettlement: '', targetCoordinates: '',
        eventSettlement: '', eventCoordinates: '', ammoType: '', initiationType: '', ammoCount: '1'
      });
      setTouched({});
      setErrors({});
    } catch (error) {
      console.error('Помилка:', error);
      showToast('error', 'Помилка при відправці. Спробуйте ще раз.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full flex items-center justify-center min-h-screen bg-neutral-50">
      {/* Toast повідомлення */}
      <Toast toast={toast} onClose={() => setToast(prev => ({ ...prev, show: false }))} />

      <div className="container max-w-xl mx-auto px-4">
        <Card className="w-full px-0 shadow-none border-none bg-transparent">
          <CardHeader className="rounded-t-lg px-0">
            <CardTitle className="flex items-center gap-2 text-2xl md:text-3xl font-bold">
              Звіт про виліт FPV-дрону
            </CardTitle>
            <CardDescription>
              Заповніть всі обов&apos;язкові поля
            </CardDescription>
          </CardHeader>

          <CardContent className="px-0">
            <div className="flex flex-col gap-6">
              {/* Форма */}
              <div className="flex-1 space-y-6">
                {/* Загальна інформація */}
                <Card className='gap-3'>
                  <CardHeader className="pb-0">
                    <CardTitle className="text-base md:text-lg">Загальна інформація</CardTitle>
                    {/* Інструкція */}
                    <Alert className="mt-1">
                      <AlertDescription className="text-xs">
                        <strong>📝 Примітка:</strong> Тільки час. Дата додається автоматично
                      </AlertDescription>
                    </Alert>
                  </CardHeader>
                  <CardContent className="grid grid-flow-row gap-3 md:gap-4">
                    <FormField label="Час скиду/ураження" error={touched.strikeTime ? errors.strikeTime : undefined}>
                      <Input
                        type="time"
                        value={formData.strikeTime}
                        onChange={(e) => handleChange('strikeTime', e.target.value)}
                        onBlur={() => handleBlur('strikeTime')}
                      />
                      <p className="text-xs text-slate-500 mt-1">Дата додається автоматично</p>
                    </FormField>

                    <FormField label="Тип вильоту" error={touched.flightType ? errors.flightType : undefined}>
                      <Select value={formData.flightType} onValueChange={(val) => handleChange('flightType', val)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Оберіть тип" />
                        </SelectTrigger>
                        <SelectContent>
                          {MISSION_TYPES.map(mission => (
                            <SelectItem key={mission} value={mission}>{mission}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormField>

                    <FormField label="Екіпаж" error={touched.crew ? errors.crew : undefined}>
                      <Select value={formData.crew} onValueChange={(val) => handleChange('crew', val)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Оберіть екіпаж" />
                        </SelectTrigger>
                        <SelectContent>
                          {CREWS.map(crew => (
                            <SelectItem key={crew} value={crew}>{crew}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormField>

                    <FormField label="Пілот" error={touched.pilot ? errors.pilot : undefined}>
                      <Select value={formData.pilot} onValueChange={(val) => handleChange('pilot', val)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Оберіть пілота" />
                        </SelectTrigger>
                        <SelectContent>
                          {PILOTS.map(pilot => (
                            <SelectItem key={pilot} value={pilot}>{pilot}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormField>

                    <div className="flex items-start flex-wrap gap-3">
                      <FormField label="Тип БпЛА" error={touched.droneType ? errors.droneType : undefined}>
                        <Select value={formData.droneType} onValueChange={(val) => handleChange('droneType', val)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Оберіть тип" />
                          </SelectTrigger>
                          <SelectContent>
                            {DRONE_TYPES.map(drone => (
                              <SelectItem key={drone} value={drone}>{drone}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormField>

                      {((formData.droneType.includes('BLINK') || formData.droneType.includes('BABABOOM 16 OPTIC'))) &&
                        <FormField label="Заводський номер" error={touched.serialNumber ? errors.serialNumber : undefined}>
                          <Input
                            type="text"
                            value={formData.serialNumber}
                            onChange={(e) => handleChange('serialNumber', e.target.value)}
                            onBlur={() => handleBlur('serialNumber')}
                            placeholder="Без номеру"
                          />
                        </FormField>}
                    </div>

                    <FormField label="Стрім" error={touched.stream ? errors.stream : undefined}>
                      <Select value={formData.stream} onValueChange={(val) => handleChange('stream', val)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Оберіть стрім" />
                        </SelectTrigger>
                        <SelectContent>
                          {STREAMS.map(stream => (
                            <SelectItem key={stream} value={stream}>{stream}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormField>
                  </CardContent>
                </Card>

                {/* Контрольні точки */}
                <Card className='gap-3'>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base md:text-lg">Контрольні точки</CardTitle>
                    {/* Інструкція */}
                    <Alert className="mt-1">
                      <AlertDescription className="text-xs">
                        <strong>📝 Примітка:</strong> Координати у форматі MGRS, наприклад: 37U CP 12345 67890
                      </AlertDescription>
                    </Alert>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    <FormField label="Населений пункт цілі" error={touched.targetSettlement ? errors.targetSettlement : undefined}>
                      <Select value={formData.targetSettlement} onValueChange={(val) => handleChange('targetSettlement', val)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Куди вилітали" />
                        </SelectTrigger>
                        <SelectContent>
                          {SETTLEMENTS.map(settlement => (
                            <SelectItem key={settlement} value={settlement}>{settlement}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormField>

                    <FormField label="Координати цілі (MGRS)" error={touched.targetCoordinates ? errors.targetCoordinates : undefined}>
                      <Input
                        value={formData.targetCoordinates}
                        onChange={(e) => handleChange('targetCoordinates', e.target.value)}
                        onBlur={() => handleBlur('targetCoordinates')}
                        placeholder="37U CP 1234567890"
                        className="font-mono"
                      />
                    </FormField>

                    <FormField label="Населений пункт події" error={touched.eventSettlement ? errors.eventSettlement : undefined}>
                      <Select value={formData.eventSettlement} onValueChange={(val) => handleChange('eventSettlement', val)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Де відбулась подія" />
                        </SelectTrigger>
                        <SelectContent>
                          {SETTLEMENTS.map(settlement => (
                            <SelectItem key={settlement} value={settlement}>{settlement}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormField>

                    <FormField label="Координати події (MGRS)" error={touched.eventCoordinates ? errors.eventCoordinates : undefined}>
                      <Input
                        value={formData.eventCoordinates}
                        onChange={(e) => handleChange('eventCoordinates', e.target.value)}
                        onBlur={() => handleBlur('eventCoordinates')}
                        placeholder="37U CP 12345 67890"
                        className="font-mono"
                      />
                    </FormField>
                  </CardContent>
                </Card>

                {/* Результат */}
                <Card className='gap-3'>
                  <CardHeader className="pb-0">
                    <CardTitle className="text-base md:text-lg">Результат вильоту</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField label="Загальний результат" error={touched.generalResult ? errors.generalResult : undefined}>
                      <Select value={formData.generalResult} onValueChange={(val) => handleChange('generalResult', val)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Оберіть результат" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hit">Ураження</SelectItem>
                          <SelectItem value="loss">Втрата борта</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormField>

                    {formData.generalResult === 'hit' && (
                      <>
                        <FormField label="Короткий опис" error={touched.shortDescription ? errors.shortDescription : undefined}>
                          <Textarea
                            value={formData.shortDescription}
                            onChange={(e) => handleChange('shortDescription', e.target.value)}
                            onBlur={() => handleBlur('shortDescription')}
                            placeholder="Наприклад: уражено скидом 2-300"
                            rows={3}
                          />
                        </FormField>

                        <FormField label="Що саме уражено" error={touched.targetDestroyed ? errors.targetDestroyed : undefined}>
                          <Select value={formData.targetDestroyed} onValueChange={(val) => handleChange('targetDestroyed', val)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Оберіть тип цілі" />
                            </SelectTrigger>
                            <SelectContent>
                              {TARGET_TYPES.map(target => (
                                <SelectItem key={target} value={target}>{target}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormField>
                      </>
                    )}

                    {formData.generalResult === 'loss' && (
                      <FormField label="Причина втрати" error={touched.lossReason ? errors.lossReason : undefined}>
                        <Select value={formData.lossReason} onValueChange={(val) => handleChange('lossReason', val)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Оберіть причину" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ворожий РЕБ">ворожий РЕБ</SelectItem>
                            <SelectItem value="збиття стрілецькою зброєю">Збили стрілецькою зброєю</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormField>
                    )}
                  </CardContent>
                </Card>

                {/* Деталі БК */}
                <Card className='gap-3'>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base md:text-lg">Деталі БК</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-3">
                    <FormField label="Тип БК" error={touched.ammoType ? errors.ammoType : undefined}>
                      <Select value={formData.ammoType} onValueChange={(val) => handleChange('ammoType', val)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Оберіть тип" />
                        </SelectTrigger>
                        <SelectContent>
                          {AMMOS_LIST.map(ammo => (
                            <SelectItem key={ammo} value={ammo}>{ammo}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormField>

                    <FormField label="Тип ініціації" error={touched.initiationType ? errors.initiationType : undefined}>
                      <Select value={formData.initiationType} onValueChange={(val) => handleChange('initiationType', val)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Оберіть тип" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Плата ініціації">Плата ініціації</SelectItem>
                          <SelectItem value="Накольний механізм">Накольний механізм</SelectItem>
                          <SelectItem value="Затримка підриву">Затримка підриву</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormField>

                    <FormField label="Кількість БК" error={touched.ammoCount ? errors.ammoCount : undefined}>
                      <Input
                        type="number"
                        value={formData.ammoCount}
                        onChange={(e) => handleChange('ammoCount', e.target.value)}
                        onBlur={() => handleBlur('ammoCount')}
                        min="1"
                        max="10"
                      />
                    </FormField>
                  </CardContent>
                </Card>

                {/* Кнопки */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowPreview(!showPreview)}
                    className="w-full sm:w-auto"
                  >
                    {showPreview ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                    {showPreview ? 'Сховати' : 'Прев\'ю'}
                  </Button>

                  <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Відправка...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Відправити звіт
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Прев'ю */}
              {showPreview && (
                <Card className="gap-1 bg-slate-50 h-fit">
                  <CardHeader className="py-0">
                    <CardTitle className="text-lg">Прев`&apos;`ю звіту</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div>
                      <p className="font-semibold text-slate-600 mb-1">Загальна інформація</p>
                      <div className="space-y-0.5 text-slate-700">
                        <p><strong>Час скиду:</strong> {formData.strikeTime || '—'}</p>
                        <p><strong>Тип:</strong> {formData.flightType || '—'}</p>
                        <p><strong>Екіпаж:</strong> {formData.crew || '—'}</p>
                        <p><strong>Пілот:</strong> {formData.pilot || '—'}</p>
                        <p><strong>БпЛА:</strong> {formData.droneType || '—'}</p>
                        <p><strong>Стрім:</strong> {formData.stream || '—'}</p>
                      </div>
                    </div>

                    <div className="border-t pt-3">
                      <p className="font-semibold text-slate-600 mb-1">Координати</p>
                      <div className="space-y-0.5 text-slate-700">
                        <p><strong>НП цілі:</strong> {formData.targetSettlement || '—'}</p>
                        <p className="font-mono text-xs"><strong>MGRS:</strong> {formData.targetCoordinates || '—'}</p>
                        <p><strong>НП події:</strong> {formData.eventSettlement || '—'}</p>
                        <p className="font-mono text-xs"><strong>MGRS:</strong> {formData.eventCoordinates || '—'}</p>
                      </div>
                    </div>

                    <div className="border-t pt-3">
                      <p className="font-semibold text-slate-600 mb-1">Результат</p>
                      <div className="space-y-0.5 text-slate-700">
                        <p>{formData.generalResult === 'hit' ? 'Ураження' : formData.generalResult === 'loss' ? 'Ціль не уражено. Втрата борта, через ' + formData.lossReason : '—'}</p>
                        {formData.generalResult === 'hit' && (
                          <>
                            <p><strong>Опис:</strong> {formData.shortDescription || '—'}</p>
                            <p><strong>Уражено:</strong> {formData.targetDestroyed || '—'}</p>
                          </>
                        )}
                        {/* {formData.generalResult === 'loss' && (
                          <p><strong>Причина:</strong> {formData.lossReason || '—'}</p>
                        )} */}
                      </div>
                    </div>

                    <div className="border-t pt-3">
                      <p className="font-semibold text-slate-600 mb-1">БК</p>
                      <div className="space-y-0.5 text-slate-700">
                        <p><strong>Тип:</strong> {formData.ammoType || '—'}</p>
                        <p><strong>Ініціація:</strong> {formData.initiationType || '—'}</p>
                        <p><strong>Кількість:</strong> {formData.ammoCount || '—'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}