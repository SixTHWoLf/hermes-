package encryption

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/base64"
	"errors"
	"fmt"
	"io"
)

// EncryptedData represents the format of stored encrypted data
type EncryptedData struct {
	CipherText string `json:"cipher_text"`
	Version    int    `json:"version"`
}

// Service handles AES-256-GCM encryption and decryption
type Service struct {
	keyManager *KeyManager
}

// NewService creates a new encryption service with the given key manager
func NewService(km *KeyManager) *Service {
	return &Service{keyManager: km}
}

// Encrypt encrypts plaintext using AES-256-GCM
// Returns base64-encoded ciphertext with version marker
func (s *Service) Encrypt(plaintext string) (*EncryptedData, error) {
	if plaintext == "" {
		return nil, errors.New("plaintext cannot be empty")
	}

	key := s.keyManager.GetCurrentKey()
	if key == nil {
		return nil, errors.New("no encryption key available")
	}

	return encryptWithKey(plaintext, key.Key, s.keyManager.GetCurrentVersion())
}

// Decrypt decrypts encrypted data using the appropriate key version
func (s *Service) Decrypt(data *EncryptedData) (string, error) {
	if data == nil {
		return "", errors.New("encrypted data cannot be nil")
	}

	key := s.keyManager.GetKey(data.Version)
	if key == nil {
		return "", fmt.Errorf("encryption key version %d not found", data.Version)
	}

	return decryptWithKey(data.CipherText, key.Key)
}

// encryptWithKey encrypts plaintext with a specific key version
func encryptWithKey(plaintext string, key []byte, version int) (*EncryptedData, error) {
	block, err := aes.NewCipher(key)
	if err != nil {
		return nil, fmt.Errorf("failed to create cipher: %w", err)
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return nil, fmt.Errorf("failed to create GCM: %w", err)
	}

	nonce := make([]byte, gcm.NonceSize())
	if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
		return nil, fmt.Errorf("failed to generate nonce: %w", err)
	}

	ciphertext := gcm.Seal(nonce, nonce, []byte(plaintext), nil)

	return &EncryptedData{
		CipherText: base64.StdEncoding.EncodeToString(ciphertext),
		Version:    version,
	}, nil
}

// decryptWithKey decrypts base64-encoded ciphertext with a specific key
func decryptWithKey(ciphertextBase64 string, key []byte) (string, error) {
	ciphertext, err := base64.StdEncoding.DecodeString(ciphertextBase64)
	if err != nil {
		return "", fmt.Errorf("failed to decode ciphertext: %w", err)
	}

	block, err := aes.NewCipher(key)
	if err != nil {
		return "", fmt.Errorf("failed to create cipher: %w", err)
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", fmt.Errorf("failed to create GCM: %w", err)
	}

	nonceSize := gcm.NonceSize()
	if len(ciphertext) < nonceSize {
		return "", errors.New("ciphertext too short")
	}

	nonce, cipherText := ciphertext[:nonceSize], ciphertext[nonceSize:]
	plaintext, err := gcm.Open(nil, nonce, cipherText, nil)
	if err != nil {
		return "", fmt.Errorf("failed to decrypt: %w", err)
	}

	return string(plaintext), nil
}
