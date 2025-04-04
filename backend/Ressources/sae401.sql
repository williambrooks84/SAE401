-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Hôte : sae-mysql
-- Généré le : ven. 04 avr. 2025 à 10:52
-- Version du serveur : 8.4.4
-- Version de PHP : 8.2.27

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `sae401`
--

-- --------------------------------------------------------

--
-- Structure de la table `doctrine_migration_versions`
--

CREATE TABLE `doctrine_migration_versions` (
  `version` varchar(191) COLLATE utf8mb3_unicode_ci NOT NULL,
  `executed_at` datetime DEFAULT NULL,
  `execution_time` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

--
-- Déchargement des données de la table `doctrine_migration_versions`
--

INSERT INTO `doctrine_migration_versions` (`version`, `executed_at`, `execution_time`) VALUES
('DoctrineMigrations\\Version20250314153213', '2025-03-14 15:32:36', 36),
('DoctrineMigrations\\Version20250320145116', '2025-03-20 14:51:39', 71),
('DoctrineMigrations\\Version20250323213906', '2025-03-23 21:41:29', 160),
('DoctrineMigrations\\Version20250324095122', '2025-03-24 09:51:30', 169),
('DoctrineMigrations\\Version20250327231057', '2025-03-27 23:11:06', 184),
('DoctrineMigrations\\Version20250328082942', '2025-03-28 08:29:50', 34),
('DoctrineMigrations\\Version20250328103218', '2025-03-28 10:32:25', 81),
('DoctrineMigrations\\Version20250331072437', '2025-03-31 07:24:45', 35),
('DoctrineMigrations\\Version20250331095147', '2025-03-31 09:52:00', 324),
('DoctrineMigrations\\Version20250401081425', '2025-04-01 08:14:31', 268),
('DoctrineMigrations\\Version20250401084946', '2025-04-01 08:49:56', 325),
('DoctrineMigrations\\Version20250401093817', '2025-04-01 09:38:43', 381),
('DoctrineMigrations\\Version20250401145025', '2025-04-01 14:50:32', 75),
('DoctrineMigrations\\Version20250401145201', '2025-04-01 14:52:38', 120),
('DoctrineMigrations\\Version20250401145356', '2025-04-01 14:53:59', 37),
('DoctrineMigrations\\Version20250402141159', '2025-04-02 14:12:05', 116),
('DoctrineMigrations\\Version20250402151254', '2025-04-02 15:13:05', 66);

-- --------------------------------------------------------

--
-- Structure de la table `follow`
--

CREATE TABLE `follow` (
  `follower_id` int NOT NULL,
  `followed_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `follow`
--

INSERT INTO `follow` (`follower_id`, `followed_id`) VALUES
(3, 5),
(3, 21),
(3, 30);

-- --------------------------------------------------------

--
-- Structure de la table `likes`
--

CREATE TABLE `likes` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `post_id` int NOT NULL,
  `created_at` datetime NOT NULL COMMENT '(DC2Type:datetime_immutable)'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `likes`
--

INSERT INTO `likes` (`id`, `user_id`, `post_id`, `created_at`) VALUES
(38, 3, 16, '2025-04-01 19:00:02'),
(49, 3, 22, '2025-04-01 20:37:33'),
(69, 3, 23, '2025-04-02 21:01:27'),
(71, 31, 23, '2025-04-02 21:33:51'),
(79, 31, 22, '2025-04-02 21:34:14'),
(81, 3, 10, '2025-04-03 19:37:32'),
(82, 3, 35, '2025-04-03 19:37:43'),
(83, 3, 36, '2025-04-03 19:37:44');

-- --------------------------------------------------------

--
-- Structure de la table `post`
--

CREATE TABLE `post` (
  `id` int NOT NULL,
  `content` varchar(280) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `user_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `post`
--

INSERT INTO `post` (`id`, `content`, `created_at`, `user_id`) VALUES
(1, 'This is my first post!', '2025-03-14 15:34:11', 3),
(6, 'Here', '2025-03-19 22:19:34', 3),
(9, 'Test 3.0', '2025-03-19 22:51:40', 3),
(10, 'Test avec A', '2025-03-21 08:33:42', 3),
(14, 'test', '2025-03-26 09:40:34', 5),
(16, 'testpost', '2025-03-28 09:32:53', 5),
(17, 'test3', '2025-03-28 10:11:18', 5),
(22, 'test45', '2025-03-28 14:03:51', 5),
(23, 'testre', '2025-03-28 14:10:35', 5),
(35, 'test', '2025-04-03 11:41:42', 30),
(36, 'text2', '2025-04-03 11:41:48', 30),
(37, 'test', '2025-04-03 19:37:35', 3);

-- --------------------------------------------------------

--
-- Structure de la table `token`
--

CREATE TABLE `token` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `value` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime NOT NULL COMMENT '(DC2Type:datetime_immutable)',
  `is_valid` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `token`
--

INSERT INTO `token` (`id`, `user_id`, `value`, `created_at`, `is_valid`) VALUES
(77, 3, 'ac2b4b19db7a42352764c982113c29f90e28257dbd05a6f5dfebc55d52bb27c3', '2025-04-02 21:43:43', 1),
(81, 3, '4b90b1bc9c33489bc705557c814359f4807bf51530b7325a3bfd15526c6888ce', '2025-04-03 19:32:36', 1);

-- --------------------------------------------------------

--
-- Structure de la table `user`
--

CREATE TABLE `user` (
  `id` int NOT NULL,
  `username` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_verified` tinyint(1) NOT NULL,
  `roles` json NOT NULL,
  `banner` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `avatar` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `location` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bio` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `website` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `user`
--

INSERT INTO `user` (`id`, `username`, `email`, `password`, `is_verified`, `roles`, `banner`, `avatar`, `location`, `bio`, `website`) VALUES
(3, 'willbrooks', 'wfjb04@aol.com', '$2y$13$oaTVHfxYvHF/GmytFxAGe.PTkx0bWypMSIeT4xDoDoBzas/lZLxbG', 1, '[\"ROLE_USER\", \"ROLE_ADMIN\"]', '/assets/banners/will-banner.jpg', '/assets/avatars/will.jpg', 'Limoges, France', '20, Web development, photography', 'https://github.com/williambrooks84'),
(5, 'testacc', 'testacc@gmail.com', '$2y$13$IrO3U6Q6X5c/P3a6N7GjJOivKLFYnRbSAMbcfiLJ0Tm9SbEUP065m', 1, '[\"ROLE_USER\", \"ROLE_USER_BLOCKED\"]', '/assets/banners/banner1.webp', '/assets/avatars/icon1.jpg', 'Poitiers, France', '21, Digital Creation', 'https://github.com'),
(16, 'test409', 'test409@gmail.com', '$2y$13$Ogr9NmcfUs6AtHUcOeugJehYS5Nqsmzgr./XHPe/gFyOBSiQOZKzK', 1, '[\"ROLE_USER\"]', NULL, NULL, NULL, NULL, NULL),
(17, 'test33333', 'test333@gmail.com', '$2y$13$LUF4eYx4g4LPExDoTMBaw.Lo2bCOtpwxdotwXV0q8XC8our.Xwj3a', 1, '[\"ROLE_USER\"]', NULL, NULL, NULL, NULL, NULL),
(21, 'testy', 'testy@gmail.com', '$2y$13$xqElD6lGPg0zHGFWzF5exuoa03X5XCBcnKLEzGoIJCHdvHWARgWjG', 1, '[\"ROLE_USER\"]', NULL, NULL, NULL, NULL, NULL),
(28, 'test676', 'test676@gmail.com', '$2y$13$UF3ap0R80wBIlr6eMjIyH.DavfD1OdMSyv49ZlAvHAiUoMFZGLLsW', 1, '[\"ROLE_USER\", \"ROLE_USER_BLOCKED\"]', NULL, NULL, NULL, NULL, NULL),
(29, 'testre', 'testre@gmail.com', '$2y$13$8784r44NtMywAx.OnFSquuOBj7PpbqCn8Sr.V7FhheehR3rSP3IgS', 1, '[\"ROLE_USER\"]', NULL, NULL, NULL, NULL, NULL),
(30, 'test24', 'test24@gmail.com', '$2y$13$aBGK4PBNVESNXYzIRx7Duuvs2062rZ/7ZHZ6lqgJgOJKQFc/LRuK6', 1, '[\"ROLE_USER\"]', '/assets/banners/banner1.webp', '/assets/avatars/icon1.jpg', 'Poitiers, France', '21, Digital Creation', NULL),
(31, 'test233', 'test233@gmail.com', '$2y$13$VIknqmiaDtR9rfpB6yC5YOstbEwPuLEGmZnnoItmsNHP3lFiWJQ06', 1, '[\"ROLE_USER\", \"ROLE_USER_BLOCKED\"]', NULL, NULL, NULL, NULL, NULL);

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `doctrine_migration_versions`
--
ALTER TABLE `doctrine_migration_versions`
  ADD PRIMARY KEY (`version`);

--
-- Index pour la table `follow`
--
ALTER TABLE `follow`
  ADD PRIMARY KEY (`follower_id`,`followed_id`),
  ADD KEY `IDX_68344470AC24F853` (`follower_id`),
  ADD KEY `IDX_68344470D956F010` (`followed_id`);

--
-- Index pour la table `likes`
--
ALTER TABLE `likes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `IDX_49CA4E7DA76ED395` (`user_id`),
  ADD KEY `IDX_49CA4E7D4B89032C` (`post_id`);

--
-- Index pour la table `post`
--
ALTER TABLE `post`
  ADD PRIMARY KEY (`id`),
  ADD KEY `IDX_5A8A6C8DA76ED395` (`user_id`);

--
-- Index pour la table `token`
--
ALTER TABLE `token`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UNIQ_5F37A13B1D775834` (`value`),
  ADD KEY `IDX_5F37A13BA76ED395` (`user_id`);

--
-- Index pour la table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `likes`
--
ALTER TABLE `likes`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=84;

--
-- AUTO_INCREMENT pour la table `post`
--
ALTER TABLE `post`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

--
-- AUTO_INCREMENT pour la table `token`
--
ALTER TABLE `token`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=82;

--
-- AUTO_INCREMENT pour la table `user`
--
ALTER TABLE `user`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `follow`
--
ALTER TABLE `follow`
  ADD CONSTRAINT `FK_68344470AC24F853` FOREIGN KEY (`follower_id`) REFERENCES `user` (`id`),
  ADD CONSTRAINT `FK_68344470D956F010` FOREIGN KEY (`followed_id`) REFERENCES `user` (`id`);

--
-- Contraintes pour la table `likes`
--
ALTER TABLE `likes`
  ADD CONSTRAINT `FK_49CA4E7D4B89032C` FOREIGN KEY (`post_id`) REFERENCES `post` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `FK_49CA4E7DA76ED395` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `post`
--
ALTER TABLE `post`
  ADD CONSTRAINT `FK_5A8A6C8DA76ED395` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`);

--
-- Contraintes pour la table `token`
--
ALTER TABLE `token`
  ADD CONSTRAINT `FK_5F37A13BA76ED395` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
