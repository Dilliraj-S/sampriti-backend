-- Payment Transactions table (Sequelize will auto-create via sync, this is for reference/manual setup)
CREATE TABLE IF NOT EXISTS `payment_transactions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `orderId` INT NOT NULL,
  `paypalOrderId` VARCHAR(255) NULL,
  `paypalCaptureId` VARCHAR(255) NULL,
  `amount` DECIMAL(12,2) NOT NULL,
  `currency` VARCHAR(10) DEFAULT 'USD',
  `status` ENUM('created','approved','completed','failed','refunded','partially_refunded') DEFAULT 'created',
  `payerEmail` VARCHAR(255) NULL,
  `payerId` VARCHAR(255) NULL,
  `paymentMethod` VARCHAR(50) DEFAULT 'paypal',
  `failureReason` TEXT NULL,
  `webhookEvents` JSON NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Add shipping column to orders if it doesn't exist
ALTER TABLE `orders` ADD COLUMN IF NOT EXISTS `shipping` DECIMAL(12,2) DEFAULT 0 AFTER `total`;

-- Add customerInfo column to orders if it doesn't exist
ALTER TABLE `orders` ADD COLUMN IF NOT EXISTS `customerInfo` JSON NULL AFTER `paymentStatus`;

-- Add shippingAddress column to orders if it doesn't exist
ALTER TABLE `orders` ADD COLUMN IF NOT EXISTS `shippingAddress` JSON NULL AFTER `customerInfo`;
