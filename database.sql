-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 04, 2026 at 07:54 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `cabana_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin_settings`
--

CREATE TABLE `admin_settings` (
  `id` int(11) NOT NULL,
  `new_bookings` tinyint(1) NOT NULL,
  `booking_cancellations` tinyint(1) NOT NULL,
  `payment_updates` tinyint(1) NOT NULL,
  `system_maintenance` tinyint(1) NOT NULL,
  `email_notifications` tinyint(1) NOT NULL,
  `admin_email` varchar(255) NOT NULL,
  `notification_frequency` varchar(50) NOT NULL,
  `essential_cookies` tinyint(1) NOT NULL,
  `analytics_cookies` tinyint(1) NOT NULL,
  `functional_cookies` tinyint(1) NOT NULL,
  `marketing_cookies` tinyint(1) NOT NULL,
  `two_factor_auth` tinyint(1) NOT NULL,
  `session_timeout` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admin_settings`
--

INSERT INTO `admin_settings` (`id`, `new_bookings`, `booking_cancellations`, `payment_updates`, `system_maintenance`, `email_notifications`, `admin_email`, `notification_frequency`, `essential_cookies`, `analytics_cookies`, `functional_cookies`, `marketing_cookies`, `two_factor_auth`, `session_timeout`) VALUES
(1, 1, 1, 1, 1, 1, 'razvan@cabana.ro', 'realtime', 1, 0, 0, 1, 0, '30');

-- --------------------------------------------------------

--
-- Table structure for table `bookings`
--

CREATE TABLE `bookings` (
  `booking_id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `cabin_id` int(11) NOT NULL,
  `check_in_date` date NOT NULL,
  `check_out_date` date NOT NULL,
  `num_guests` int(11) NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `status` enum('pending','confirmed','cancelled','completed') DEFAULT 'pending',
  `special_requests` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `expires_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `bookings`
--

INSERT INTO `bookings` (`booking_id`, `customer_id`, `cabin_id`, `check_in_date`, `check_out_date`, `num_guests`, `total_price`, `status`, `special_requests`, `created_at`, `updated_at`, `expires_at`) VALUES
(1, 1, 6, '2026-02-23', '2026-02-25', 2, 1000.00, 'cancelled', 'vreau vila cu pisicina', '2026-02-22 20:29:18', '2026-02-22 20:45:15', '2026-02-22 18:44:18'),
(2, 2, 2, '2026-02-24', '2026-02-25', 1, 450.00, 'cancelled', NULL, '2026-02-23 20:43:41', '2026-02-25 16:59:20', '2026-02-23 18:58:41'),
(3, 3, 6, '2026-03-11', '2026-03-13', 1, 1000.00, 'confirmed', NULL, '2026-03-04 14:02:28', '2026-03-04 14:04:05', '2026-03-04 12:17:28');

-- --------------------------------------------------------

--
-- Table structure for table `cabins`
--

CREATE TABLE `cabins` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `capacity` int(11) NOT NULL,
  `bedrooms` int(11) NOT NULL,
  `bathrooms` decimal(3,1) NOT NULL,
  `price_per_night` decimal(10,2) NOT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `is_available` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `status` varchar(50) DEFAULT 'available',
  `amenities` text DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `cabins`
--

INSERT INTO `cabins` (`id`, `name`, `description`, `capacity`, `bedrooms`, `bathrooms`, `price_per_night`, `image_url`, `is_available`, `created_at`, `updated_at`, `status`, `amenities`, `location`) VALUES
(1, 'Lakeside Cabin', 'Charming lakefront cabin with private dock and sunset views. Ideal for couples or small families.', 4, 0, 0.0, 350.00, 'http://localhost:3000/images/lakeview_cabin.png', 1, '2026-02-22 15:22:25', '2026-02-22 18:40:30', 'available', 'WiFi,Lake Access,Kayaks,Fishing Gear,Fire Pit,Coffee Maker', 'Lake Area'),
(2, 'Mountainview Cabin', ' Luxurious mountain cabin with stunning panoramic views. Perfect for families seeking adventure and relaxation.', 6, 0, 0.0, 450.00, 'http://localhost:3000/images/mountainview_cabin.png', 1, '2026-02-22 15:58:44', '2026-02-22 14:00:28', 'available', 'WiFi, Fireplace, Mountain View, Hot Tub, BBQ Grill, Full Kitchen', NULL),
(3, 'Forestview Cabin', 'Intimate forest cabin surrounded by towering pines. Perfect romantic getaway with cozy interiors.', 4, 0, 0.0, 200.00, 'http://localhost:3000/images/forestview_cabin.png', 1, '2026-02-22 16:02:39', '2026-02-22 14:03:42', 'available', 'WiFi,Forest Trail Access,Wood Stove,Reading Nook,Hammock', 'Forest Area'),
(4, 'Standard Cabin', 'Comfortable standard cabin perfect for couples on a budget. Clean, cozy, and equipped with essential amenities for a pleasant stay.', 2, 0, 0.0, 150.00, 'http://localhost:3000/images/standard_cabin.png', 1, '2026-02-22 16:07:24', '2026-02-22 16:07:24', 'available', 'WiFi, Parking, Coffee Maker, Basic Kitchen', 'Cabin Area'),
(5, 'Deluxe Cabin', 'Upgraded deluxe cabin with modern comforts and stylish interiors. Features premium furnishings, a private terrace, and luxury bathroom amenities.', 4, 0, 0.0, 350.00, 'http://localhost:3000/images/deluxe_cabin.png', 1, '2026-02-22 16:08:33', '2026-02-22 18:27:41', 'available', 'WiFi, Fireplace, Terrace, Full Kitchen, Smart TV, Premium Bedding, Coffee Machine', 'Cabin Area'),
(6, 'Suite Cabin', 'Luxury suite cabin with premium amenities and elegant design. Features a master suite with spa-like bathroom, gourmet kitchen, and private hot tub under the stars.', 6, 0, 0.0, 500.00, 'http://localhost:3000/images/suite_cabin.jfif', 1, '2026-02-22 16:09:37', '2026-03-04 12:05:08', 'available', 'WiFi, Hot Tub, Sauna, Wine Cooler, King Bed, En-suite Bathrooms, Gourmet Kitchen, Sound System', 'Cabin Area');

-- --------------------------------------------------------

--
-- Table structure for table `customers`
--

CREATE TABLE `customers` (
  `customer_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `customers`
--

INSERT INTO `customers` (`customer_id`, `name`, `email`, `phone`, `created_at`) VALUES
(1, 'gogu', 'gogu@test.ro', '0733333333', '2026-02-22 20:29:18'),
(2, 'doe doe', 'doe@test.ro', '1234567890', '2026-02-23 20:43:40'),
(3, 'Razvan Andrei', 'razvan@test.ro', '0712121121', '2026-03-04 14:02:28');

-- --------------------------------------------------------

--
-- Table structure for table `maintenance_logs`
--

CREATE TABLE `maintenance_logs` (
  `log_id` int(11) NOT NULL,
  `cabin_id` int(11) NOT NULL,
  `staff_id` int(11) DEFAULT NULL,
  `description` text NOT NULL,
  `log_date` datetime NOT NULL,
  `log_type` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `messages`
--

CREATE TABLE `messages` (
  `message_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `subject` varchar(200) NOT NULL,
  `content` text NOT NULL,
  `customer_id` int(11) DEFAULT NULL,
  `staff_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `category` varchar(50) NOT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `sent_at` datetime DEFAULT NULL,
  `is_starred` tinyint(1) DEFAULT 0,
  `is_archived` tinyint(1) DEFAULT 0,
  `is_deleted` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `messages`
--

INSERT INTO `messages` (`message_id`, `name`, `email`, `phone`, `subject`, `content`, `customer_id`, `staff_id`, `created_at`, `updated_at`, `category`, `is_read`, `sent_at`, `is_starred`, `is_archived`, `is_deleted`) VALUES
(1, 'gogu', 'gogu@test.ro', '0733333333', 'Booking Cancelled - Payment Not Received', 'Dear gogu,\n\nYour booking at The Cabin Oasis has expired and was cancelled because payment was not completed in time.\n\nCabin: Suite Cabin\nCheck-in: 2026-02-23\nCheck-out: 2026-02-25\nGuests: 2\nBooking ID: 1\n\nIf you still wish to stay with us, please create a new reservation on our website.\nThe Cabin Oasis Team', 1, NULL, '2026-02-22 20:45:15', '2026-02-22 20:45:15', 'booking', 1, '2026-02-22 20:45:15', 0, 0, 0),
(2, 'doe doe', 'doe@test.ro', '1234567890', 'Booking Cancelled - Payment Not Received', 'Dear doe doe,\n\nYour booking at The Cabin Oasis has expired and was cancelled because payment was not completed in time.\n\nCabin: Mountainview Cabin\nCheck-in: 2026-02-24\nCheck-out: 2026-02-25\nGuests: 1\nBooking ID: 2\n\nIf you still wish to stay with us, please create a new reservation on our website.\nThe Cabin Oasis Team', 2, NULL, '2026-02-25 16:59:20', '2026-02-25 16:59:20', 'booking', 1, '2026-02-25 16:59:20', 0, 0, 0),
(3, 'Razvan Andrei', 'razvan@test.ro', '0712121121', 'Booking Confirmed - Booking #3', 'Dear Razvan Andrei,\n\nYour booking at The Cabin Oasis has been confirmed!\n\nCabin: Suite Cabin\nCheck-in: 2026-03-11\nCheck-out: 2026-03-13\nGuests: 1\nTotal: $1000.00\nBooking ID: 3\n\nWe look forward to welcoming you.\nThe Cabin Oasis Team', 3, NULL, '2026-03-04 14:04:06', '2026-03-04 14:04:06', 'booking', 1, '2026-03-04 14:04:06', 0, 0, 0);

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `notification_id` int(11) NOT NULL,
  `staff_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `is_read` tinyint(1) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`notification_id`, `staff_id`, `title`, `message`, `is_read`, `created_at`) VALUES
(1, 2, 'New Booking', 'A new booking has been created for cabin Suite Cabin by gogu. Booking ID: 1', 0, '2026-02-22 22:29:18'),
(2, 4, 'New Booking', 'A new booking has been created for cabin Suite Cabin by gogu. Booking ID: 1', 1, '2026-02-22 22:29:18'),
(3, 2, 'New Booking', 'A new booking has been created for cabin Mountainview Cabin by doe doe. Booking ID: 2', 0, '2026-02-23 22:43:41'),
(4, 4, 'New Booking', 'A new booking has been created for cabin Mountainview Cabin by doe doe. Booking ID: 2', 1, '2026-02-23 22:43:41'),
(5, 2, 'New Booking', 'A new booking has been created for cabin Suite Cabin by Razvan Andrei. Booking ID: 3', 0, '2026-03-04 16:02:28'),
(6, 4, 'New Booking', 'A new booking has been created for cabin Suite Cabin by Razvan Andrei. Booking ID: 3', 1, '2026-03-04 16:02:28');

-- --------------------------------------------------------

--
-- Table structure for table `staff`
--

CREATE TABLE `staff` (
  `staff_id` int(11) NOT NULL,
  `full_name` varchar(200) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `role` enum('admin','manager','maintenance') NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `status` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `staff`
--

INSERT INTO `staff` (`staff_id`, `full_name`, `email`, `phone`, `role`, `password_hash`, `created_at`, `updated_at`, `status`) VALUES
(2, 'Admin Principal', 'admin@cabana.ro', NULL, 'admin', '$2b$12$RzTyz1Z3jH1EKsKa50kMluwL3f9b8uGHro72uX./y4VEQ/kWZ3gd6', '2026-02-15 20:30:52', '2026-02-15 20:30:52', 1),
(4, 'razvan d', 'razvan@cabana.ro', '', 'admin', '$2b$12$jVHqJfZBHEWEwtNv38SrG.L0qnbxsQpdh2hgp.sMZ.bywFTEt/sQ2', '2026-02-20 17:42:26', '2026-02-20 16:47:22', 1);

-- --------------------------------------------------------

--
-- Table structure for table `transactions`
--

CREATE TABLE `transactions` (
  `transaction_id` int(11) NOT NULL,
  `booking_id` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_method` varchar(50) NOT NULL,
  `transaction_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` enum('pending','completed','failed','refunded') NOT NULL,
  `payment_reference` varchar(100) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `transactions`
--

INSERT INTO `transactions` (`transaction_id`, `booking_id`, `amount`, `payment_method`, `transaction_date`, `status`, `payment_reference`, `notes`, `created_at`, `updated_at`) VALUES
(1, 3, 1000.00, 'card', '2026-03-04 14:04:05', 'completed', NULL, NULL, '2026-03-04 14:04:05', '2026-03-04 14:04:05');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('customer','admin','manager','maintenance') NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin_settings`
--
ALTER TABLE `admin_settings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ix_admin_settings_id` (`id`);

--
-- Indexes for table `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`booking_id`),
  ADD KEY `idx_booking_dates` (`check_in_date`,`check_out_date`),
  ADD KEY `idx_booking_customer` (`customer_id`),
  ADD KEY `idx_booking_cabin` (`cabin_id`);

--
-- Indexes for table `cabins`
--
ALTER TABLE `cabins`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`customer_id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `maintenance_logs`
--
ALTER TABLE `maintenance_logs`
  ADD PRIMARY KEY (`log_id`),
  ADD KEY `idx_maintenance_cabin` (`cabin_id`),
  ADD KEY `idx_maintenance_staff` (`staff_id`);

--
-- Indexes for table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`message_id`),
  ADD KEY `staff_id` (`staff_id`),
  ADD KEY `idx_message_customer` (`customer_id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`notification_id`),
  ADD KEY `staff_id` (`staff_id`),
  ADD KEY `ix_notifications_notification_id` (`notification_id`);

--
-- Indexes for table `staff`
--
ALTER TABLE `staff`
  ADD PRIMARY KEY (`staff_id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`transaction_id`),
  ADD KEY `idx_transaction_date` (`transaction_date`),
  ADD KEY `idx_transaction_booking` (`booking_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ix_users_email` (`email`),
  ADD KEY `ix_users_id` (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin_settings`
--
ALTER TABLE `admin_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `bookings`
--
ALTER TABLE `bookings`
  MODIFY `booking_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `cabins`
--
ALTER TABLE `cabins`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `customers`
--
ALTER TABLE `customers`
  MODIFY `customer_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `maintenance_logs`
--
ALTER TABLE `maintenance_logs`
  MODIFY `log_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `messages`
--
ALTER TABLE `messages`
  MODIFY `message_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `notification_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `staff`
--
ALTER TABLE `staff`
  MODIFY `staff_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `transactions`
--
ALTER TABLE `transactions`
  MODIFY `transaction_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `bookings`
--
ALTER TABLE `bookings`
  ADD CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`customer_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`cabin_id`) REFERENCES `cabins` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `maintenance_logs`
--
ALTER TABLE `maintenance_logs`
  ADD CONSTRAINT `maintenance_logs_ibfk_1` FOREIGN KEY (`cabin_id`) REFERENCES `cabins` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `maintenance_logs_ibfk_2` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`staff_id`) ON DELETE SET NULL;

--
-- Constraints for table `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`customer_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`staff_id`) ON DELETE SET NULL;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`staff_id`);

--
-- Constraints for table `transactions`
--
ALTER TABLE `transactions`
  ADD CONSTRAINT `transactions_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`booking_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
