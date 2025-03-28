-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Hôte : sae-mysql
-- Généré le : ven. 28 mars 2025 à 15:48
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
('DoctrineMigrations\\Version20250328103218', '2025-03-28 10:32:25', 81);

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
(2, 'Just a quick update, I am learning Symfony.', '2025-03-14 15:34:11', 3),
(3, 'Another post for testing purposes.', '2025-03-14 15:34:11', 3),
(5, 'Test', '2025-03-19 22:18:34', 3),
(6, 'Here', '2025-03-19 22:19:34', 3),
(9, 'Test 3.0', '2025-03-19 22:51:40', 3),
(10, 'Test avec A', '2025-03-21 08:33:42', 3),
(11, 'test2', '2025-03-26 08:25:19', 3),
(12, 'This is a sample post content.', '2025-03-26 09:37:58', 3),
(14, 'test', '2025-03-26 09:40:34', 5),
(15, 'test', '2025-03-26 12:46:57', 3),
(16, 'testpost', '2025-03-28 09:32:53', 17),
(17, 'test3', '2025-03-28 10:11:18', 17),
(18, 'test123', '2025-03-28 10:40:58', 3),
(19, 'test', '2025-03-28 12:18:42', 3),
(20, 'test', '2025-03-28 12:43:23', 3),
(21, 'test', '2025-03-28 13:57:18', 3),
(22, 'test45', '2025-03-28 14:03:51', 28),
(23, 'testre', '2025-03-28 14:10:35', 29);

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
(37, 3, '9e4eb435ee31da3b075409caf007cff77de6fa1cb720a10a023759cd8ee59996', '2025-03-28 15:47:52', 1);

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
  `roles` json NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `user`
--

INSERT INTO `user` (`id`, `username`, `email`, `password`, `is_verified`, `roles`) VALUES
(3, 'willbrooks', 'wfjb04@aol.com', '$2y$13$oaTVHfxYvHF/GmytFxAGe.PTkx0bWypMSIeT4xDoDoBzas/lZLxbG', 1, '[\"ROLE_USER\", \"ROLE_ADMIN\"]'),
(5, 'test3', 'test3@gmail.com', '$2y$13$IrO3U6Q6X5c/P3a6N7GjJOivKLFYnRbSAMbcfiLJ0Tm9SbEUP065m', 0, '[\"ROLE_USER\"]'),
(16, 'test409', 'test409@gmail.com', '$2y$13$Ogr9NmcfUs6AtHUcOeugJehYS5Nqsmzgr./XHPe/gFyOBSiQOZKzK', 1, '[\"ROLE_USER\"]'),
(17, 'test33333', 'test333@gmail.com', '$2y$13$LUF4eYx4g4LPExDoTMBaw.Lo2bCOtpwxdotwXV0q8XC8our.Xwj3a', 1, '[\"ROLE_USER\"]'),
(21, 'testy', 'testy@gmail.com', '$2y$13$xqElD6lGPg0zHGFWzF5exuoa03X5XCBcnKLEzGoIJCHdvHWARgWjG', 1, '[\"ROLE_USER\"]'),
(28, 'test676', 'test676@gmail.com', '$2y$13$UF3ap0R80wBIlr6eMjIyH.DavfD1OdMSyv49ZlAvHAiUoMFZGLLsW', 1, '[\"ROLE_USER\"]'),
(29, 'testre', 'testre@gmail.com', '$2y$13$8784r44NtMywAx.OnFSquuOBj7PpbqCn8Sr.V7FhheehR3rSP3IgS', 1, '[\"ROLE_USER\"]');

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `doctrine_migration_versions`
--
ALTER TABLE `doctrine_migration_versions`
  ADD PRIMARY KEY (`version`);

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
-- AUTO_INCREMENT pour la table `post`
--
ALTER TABLE `post`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT pour la table `token`
--
ALTER TABLE `token`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

--
-- AUTO_INCREMENT pour la table `user`
--
ALTER TABLE `user`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- Contraintes pour les tables déchargées
--

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
