import Icon from '@/components/ui/icon';

interface Props {
  activeChat: number | null;
  onSelectChat: (id: number) => void;
  searchQuery: string;
}

export default function ChatList({ searchQuery }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center text-messenger-text-secondary">
      <div className="w-14 h-14 rounded-2xl bg-messenger-blue-light flex items-center justify-center mb-4">
        <Icon name="MessageCircle" size={26} className="text-messenger-blue" />
      </div>
      {searchQuery ? (
        <>
          <Icon name="Search" size={20} className="mb-2 opacity-30" />
          <p className="text-sm">Ничего не найдено</p>
        </>
      ) : (
        <>
          <p className="text-sm font-medium text-gray-700 mb-1">Пока нет чатов</p>
          <p className="text-xs leading-relaxed">Здесь появятся ваши диалоги,<br/>когда вы начнёте переписку</p>
        </>
      )}
    </div>
  );
}
