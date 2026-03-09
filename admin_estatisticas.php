<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
include_once 'conexao.php';

$estatisticas = array("users" => 0, "pending" => 0, "approved" => 0, "rejected" => 0);

// Contar utilizadores
$res = $conexao->query("SELECT COUNT(*) as total FROM usuarios");
if ($res) $estatisticas['users'] = $res->fetch_assoc()['total'];

// Contar pendentes
$res = $conexao->query("SELECT COUNT(*) as total FROM anuncios WHERE status_aprovacao = 'pendente'");
if ($res) $estatisticas['pending'] = $res->fetch_assoc()['total'];

// Contar aprovados
$res = $conexao->query("SELECT COUNT(*) as total FROM anuncios WHERE status_aprovacao = 'aprovado'");
if ($res) $estatisticas['approved'] = $res->fetch_assoc()['total'];

// Contar rejeitados
$res = $conexao->query("SELECT COUNT(*) as total FROM anuncios WHERE status_aprovacao = 'rejeitado'");
if ($res) $estatisticas['rejected'] = $res->fetch_assoc()['total'];

echo json_encode(array("status" => true, "estatisticas" => $estatisticas));
?>