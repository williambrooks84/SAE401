<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250410084534 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE user_block (id INT AUTO_INCREMENT NOT NULL, blocker_id INT DEFAULT NULL, blocked_id INT DEFAULT NULL, blocked_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', INDEX IDX_61D96C7A548D5975 (blocker_id), INDEX IDX_61D96C7A21FF5136 (blocked_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE user_block ADD CONSTRAINT FK_61D96C7A548D5975 FOREIGN KEY (blocker_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE user_block ADD CONSTRAINT FK_61D96C7A21FF5136 FOREIGN KEY (blocked_id) REFERENCES user (id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE user_block DROP FOREIGN KEY FK_61D96C7A548D5975');
        $this->addSql('ALTER TABLE user_block DROP FOREIGN KEY FK_61D96C7A21FF5136');
        $this->addSql('DROP TABLE user_block');
    }
}
