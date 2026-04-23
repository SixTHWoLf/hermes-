'use client';

import { useTranslation } from 'react-i18next';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const handleLanguageChange = (value: string | null) => {
    if (value) {
      i18n.changeLanguage(value);
    }
  };

  return (
    <Select value={i18n.language} onValueChange={handleLanguageChange}>
      <SelectTrigger className="w-[100px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="en">English</SelectItem>
        <SelectItem value="zh">中文</SelectItem>
      </SelectContent>
    </Select>
  );
}