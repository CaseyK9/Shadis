<?php
require_once "../protected/db.inc.php";
require_once "../protected/output.inc.php";
require_once "../protected/input.inc.php";
session_start();

// Request can only be POST
$input->whitelist_request_method("POST");

// Rewrap data assuming it is a JSON request
if (empty($_POST)) {
  $_POST = $input->read_as_json();
}

$token = $input->post("token");
$selection = $input->post("selection");
$action = $input->post("action");

/**
 * Login check
 * If an edit token was given, this can be ignored.
 */
if (!isset($_SESSION["u_id"]) && !isset($token)) {
  error("Unauthorized", 401);
}

// Input check
if (
  (!isset($selection) && !isset($token)) ||
  (empty($selection) && empty($token)) ||
  !isset($action) || empty($action)
) {
  error("Missing input! Arguments needed: (selection or token) and action", 400);
}

/**
 * Try to acquire the file ID for the provided token and assign it to $selection.
 * This is a simpler approach than making sure $token exists in every step.
 */
if (isset($token)) {
  if (is_string($token) && strlen($token) === 16) {
    $res = $db->request("SELECT id FROM `" . $table_prefix . "files` WHERE token=?", "s", $token);
    $res_array = $res->fetch_assoc();
    if (!$res_array) error("Provided token not found", 400);
    $selection = array($res_array["id"]);
  } else {
    error("Provided token not found", 400);
  }
}

/**
 * The selection can also consist of a single file ID.
 * In this case, enclosing it in an array should not be necessary.
 */
if (is_string($selection)) {
  $selection = array($selection);
}

/**
 * Generates questionmarks to be used in a mysqli_stmt.
 * 
 * @param array $array The array of parameters that should be used in the statement.
 * @return string e.g.: "?, ?, ?, ?, ?"
 */
function generate_q_marks($array)
{
  $len = count($array);
  return (str_repeat("?, ", $len - 1) . "?");
}

/**
 * Generates a types string as is requested in a mysqli_stmt.
 * 
 * @param array $array The array of parameters that should be used in the statement.
 * @return string e.g.: "ssssss"
 */
function generate_string_types($array)
{
  $len = count($array);
  return (str_repeat("s", $len));
}

if ($action === "delete") {
  $db->request("DELETE FROM `" . $table_prefix . "files` WHERE id IN (" . generate_q_marks($selection) . ")", generate_string_types($selection), ...$selection);
  $db->request("DELETE FROM `" . $table_prefix . "file_tasks` WHERE id IN (" . generate_q_marks($selection) . ")", generate_string_types($selection), ...$selection);
  $uploads_folder = dirname(__FILE__) . "/../uploads/";
  $dir_contents = array_diff(scandir($uploads_folder), array('..', '.'));

  if (!$dir_contents) {
    error("Directory empty or was not found", 500, "error.directoryNotFound");
  }

  foreach ($selection as $selected_id) {
    foreach ($dir_contents as $filename) {
      if (!is_dir($filename) && strpos($filename, $selected_id . ".") !== false) {
        if (!unlink($uploads_folder . $filename)) {
          error("File " . $filename . " could not be deleted");
        }
      }
    }
  }
} elseif ($action === "editTitle") {
  $value = $input->post("value");

  if (!isset($value) || !is_string($value)) {
    error("Missing input! Arguments needed: (selection or token), action and value", 400);
  }

  $req = $db->request("UPDATE `" . $table_prefix . "files` SET title=? WHERE id IN (" . generate_q_marks($selection) . ")", "s" . generate_string_types($selection), $value, ...$selection);
} else {
  error("Provided action does not exist", 400);
}

respond("Task successfully executed!");
