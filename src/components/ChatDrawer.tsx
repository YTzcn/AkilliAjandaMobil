import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
  TextInput,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback
} from 'react-native';
import { COLORS, FONTS, SIZES } from '../styles/theme';

// SVG ikonları için import
import SendIcon from '../assets/icons/send.svg';
import CloseIcon from '../assets/icons/close.svg';

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = Math.min(width * 0.85, 400);

interface ChatDrawerProps {
  isVisible: boolean;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
  isLoading?: boolean;
}

const ChatDrawer: React.FC<ChatDrawerProps> = ({ isVisible, onClose }) => {
  const slideAnim = useRef(new Animated.Value(DRAWER_WIDTH)).current;
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [dots, setDots] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);
  const typingInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isVisible) {
      // Drawer'ı aç
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 10
      }).start();
    } else {
      // Drawer'ı kapat
      Animated.spring(slideAnim, {
        toValue: DRAWER_WIDTH,
        useNativeDriver: true,
        tension: 50,
        friction: 10
      }).start();
    }
  }, [isVisible]);

  // Yazıyor animasyonu için useEffect
  useEffect(() => {
    if (isTyping) {
      let count = 0;
      typingInterval.current = setInterval(() => {
        count = (count + 1) % 4;
        setDots('.'.repeat(count));
      }, 500);
    } else {
      if (typingInterval.current) {
        clearInterval(typingInterval.current);
      }
      setDots('');
    }

    return () => {
      if (typingInterval.current) {
        clearInterval(typingInterval.current);
      }
    };
  }, [isTyping]);

  const LoadingDots = () => {
    return (
      <View style={[styles.message, styles.aiMessage]}>
        <Text style={[styles.messageText, styles.aiMessageText]}>
          {dots}
        </Text>
      </View>
    );
  };

  const handleSend = () => {
    if (message.trim()) {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        text: message,
        isUser: true,
        timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, newMessage]);
      setMessage('');
      setIsTyping(true);

      // Yapay zeka yanıtı
      setTimeout(() => {
        setIsTyping(false);
        const aiResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: 'Bugün, 11 Mayıs 2025 tarihinde, ajandanızda herhangi bir etkinlik veya görev planlanmamış. Gününüz boş görünüyor!',
          isUser: false,
          timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, aiResponse]);
      }, 2000);
    }
  };

  return (
    <>
      {isVisible && (
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>
      )}
      <Animated.View
        style={[
          styles.drawer,
          {
            transform: [{ translateX: slideAnim }]
          }
        ]}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Akıllı Asistan</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <CloseIcon width={24} height={24} color={COLORS.textDark} />
          </TouchableOpacity>
        </View>

        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((msg) => (
            <View
              key={msg.id}
              style={[
                styles.messageWrapper,
                msg.isUser ? styles.userMessageWrapper : styles.aiMessageWrapper
              ]}
            >
              <View style={[
                styles.message,
                msg.isUser ? styles.userMessage : styles.aiMessage
              ]}>
                <Text style={[
                  styles.messageText,
                  msg.isUser ? styles.userMessageText : styles.aiMessageText
                ]}>{msg.text}</Text>
                <Text style={[
                  styles.timestamp,
                  msg.isUser ? styles.userTimestamp : styles.aiTimestamp
                ]}>{msg.timestamp}</Text>
              </View>
            </View>
          ))}
          {isTyping && (
            <View style={[styles.messageWrapper, styles.aiMessageWrapper]}>
              <LoadingDots />
            </View>
          )}
        </ScrollView>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
          style={styles.inputContainer}
        >
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Mesajınızı yazın..."
              value={message}
              onChangeText={setMessage}
              multiline
              maxLength={500}
              placeholderTextColor={COLORS.textLight}
              editable={!isTyping}
            />
            <TouchableOpacity
              style={[
                styles.sendButton, 
                (!message.trim() || isTyping) && styles.sendButtonDisabled
              ]}
              onPress={handleSend}
              disabled={!message.trim() || isTyping}
            >
              <SendIcon 
                width={20} 
                height={20} 
                color={(!message.trim() || isTyping) ? COLORS.textLight : COLORS.white} 
              />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  drawer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: COLORS.white,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    backgroundColor: COLORS.white,
  },
  title: {
    ...FONTS.h2,
    color: COLORS.textDark,
    fontSize: 20,
  },
  closeButton: {
    padding: SIZES.padding / 2,
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  messagesContent: {
    padding: SIZES.padding,
  },
  messageWrapper: {
    marginBottom: SIZES.margin,
    flexDirection: 'row',
  },
  userMessageWrapper: {
    justifyContent: 'flex-end',
  },
  aiMessageWrapper: {
    justifyContent: 'flex-start',
  },
  message: {
    maxWidth: '80%',
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  userMessage: {
    backgroundColor: COLORS.primary,
    borderTopRightRadius: SIZES.radius / 2,
  },
  aiMessage: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: SIZES.radius / 2,
  },
  messageText: {
    ...FONTS.body,
    fontSize: 15,
  },
  userMessageText: {
    color: COLORS.white,
  },
  aiMessageText: {
    color: COLORS.textDark,
  },
  timestamp: {
    ...FONTS.small,
    fontSize: 11,
    marginTop: 4,
  },
  userTimestamp: {
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'right',
  },
  aiTimestamp: {
    color: COLORS.textLight,
    textAlign: 'right',
  },
  inputContainer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    padding: SIZES.padding,
    backgroundColor: COLORS.white,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: SIZES.padding / 2,
  },
  input: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    maxHeight: 100,
    ...FONTS.body,
  },
  sendButton: {
    backgroundColor: COLORS.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  sendButtonDisabled: {
    backgroundColor: '#F5F7FA',
  },
});

export default ChatDrawer; 