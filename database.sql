CREATE DATABASE `quozul.dev` /*!40100 DEFAULT CHARACTER SET latin1 COLLATE latin1_general_cs */;

use `quozul.dev`;

CREATE TABLE `user` (
  `id_user` char(36) COLLATE latin1_general_cs NOT NULL,
  `username` varchar(32) COLLATE latin1_general_cs NOT NULL,
  `password` varchar(256) COLLATE latin1_general_cs NOT NULL,
  `email` varchar(320) COLLATE latin1_general_cs DEFAULT NULL,
  `created` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_user`),
  UNIQUE KEY `username_UNIQUE` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_general_cs;

CREATE TABLE `history_ip` (
  `id_history_ip` int(11) NOT NULL AUTO_INCREMENT,
  `ip` varchar(45) COLLATE latin1_general_cs DEFAULT NULL,
  PRIMARY KEY (`id_history_ip`),
  UNIQUE KEY `ip_UNIQUE` (`ip`)
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=latin1 COLLATE=latin1_general_cs;

CREATE TABLE `history_useragent` (
  `id_history_useragent` int(11) NOT NULL AUTO_INCREMENT,
  `useragent` varchar(1024) COLLATE latin1_general_cs DEFAULT NULL,
  PRIMARY KEY (`id_history_useragent`),
  UNIQUE KEY `useragent_UNIQUE` (`useragent`)
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=latin1 COLLATE=latin1_general_cs;

CREATE TABLE `history_login` (
  `id_history_login` int(11) NOT NULL AUTO_INCREMENT,
  `user` char(36) COLLATE latin1_general_cs NOT NULL,
  `date` datetime NOT NULL DEFAULT current_timestamp(),
  `useragent` int(11) DEFAULT NULL,
  `ip` int(11) DEFAULT NULL,
  PRIMARY KEY (`id_history_login`),
  KEY `useragent_idx` (`useragent`),
  KEY `ip_idx` (`ip`),
  KEY `user` (`user`),
  CONSTRAINT `ip` FOREIGN KEY (`ip`) REFERENCES `history_ip` (`id_history_ip`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `user` FOREIGN KEY (`user`) REFERENCES `user` (`id_user`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `useragent` FOREIGN KEY (`useragent`) REFERENCES `history_useragent` (`id_history_useragent`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=latin1 COLLATE=latin1_general_cs;