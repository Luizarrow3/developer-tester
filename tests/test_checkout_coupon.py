import os
import re
from decimal import Decimal

import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait


WAIT_SECONDS = 15


def selector(name, default):
    return os.getenv(f"SEL_{name.upper()}", default)


def money_value(text):
    value = re.sub(r"[^\d,.-]", "", text)
    if "," in value:
        value = value.replace(".", "").replace(",", ".")
    return Decimal(value)


def click(driver, name, default):
    element = WebDriverWait(driver, WAIT_SECONDS).until(
        EC.element_to_be_clickable((By.CSS_SELECTOR, selector(name, default)))
    )
    element.click()
    return element


def visible_text(driver, name, default):
    element = WebDriverWait(driver, WAIT_SECONDS).until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, selector(name, default)))
    )
    return element.text.strip()


@pytest.fixture
def driver(request):
    base_url = os.getenv("BASE_URL")
    if request.node.get_closest_marker("expired_coupon"):
        base_url = os.getenv("EXPIRED_COUPON_BASE_URL")
        if not base_url:
            pytest.skip("Defina EXPIRED_COUPON_BASE_URL para o ambiente com VIP20 expirado.")
    username = os.getenv("TEST_USER")
    password = os.getenv("TEST_PASSWORD")
    if not all((base_url, username, password)):
        pytest.fail("Defina BASE_URL, TEST_USER e TEST_PASSWORD para executar os testes.")

    options = webdriver.ChromeOptions()
    if os.getenv("HEADLESS", "true").lower() == "true":
        options.add_argument("--headless=new")
    options.add_argument("--window-size=1440,1000")
    options.set_capability("goog:loggingPrefs", {"performance": "ALL"})
    browser = webdriver.Chrome(options=options)
    browser.execute_cdp_cmd("Network.enable", {})
    browser.get(base_url)

    WebDriverWait(browser, WAIT_SECONDS).until(
        EC.visibility_of_element_located(
            (By.CSS_SELECTOR, selector("login_user", '[data-testid="login-user"]'))
        )
    ).send_keys(username)
    browser.find_element(
        By.CSS_SELECTOR, selector("login_password", '[data-testid="login-password"]')
    ).send_keys(password)
    click(browser, "login_submit", '[data-testid="login-submit"]')

    yield browser
    browser.quit()


def open_checkout(driver, product_buttons):
    for name, default in product_buttons:
        click(driver, name, default)
    click(driver, "checkout", '[data-testid="checkout"]')
    WebDriverWait(driver, WAIT_SECONDS).until(
        EC.visibility_of_element_located(
            (By.CSS_SELECTOR, selector("coupon_input", '[data-testid="coupon-input"]'))
        )
    )


def apply_vip20(driver):
    coupon = driver.find_element(
        By.CSS_SELECTOR, selector("coupon_input", '[data-testid="coupon-input"]')
    )
    coupon.clear()
    coupon.send_keys("VIP20")
    click(driver, "coupon_apply", '[data-testid="coupon-apply"]')


@pytest.mark.case_id("CT_CHECKOUT_001")
@pytest.mark.case_title("Validar aplicação do cupom VIP20 com carrinho acima de R$ 100,00")
def test_vip20_applies_to_eligible_cart_over_100(driver):
    open_checkout(
        driver,
        [
            ("product_a_add", '[data-testid="product-a-add"]'),
            ("product_b_add", '[data-testid="product-b-add"]'),
        ],
    )
    apply_vip20(driver)

    assert visible_text(driver, "coupon_success", '[data-testid="coupon-success"]') == (
        "Cupom VIP20 aplicado com sucesso!"
    )
    assert money_value(visible_text(driver, "subtotal", '[data-testid="subtotal"]')) == Decimal("110.00")
    assert money_value(visible_text(driver, "discount", '[data-testid="discount"]')) == Decimal("22.00")
    assert money_value(visible_text(driver, "total", '[data-testid="total"]')) == Decimal("88.00")


@pytest.mark.case_id("CT_CHECKOUT_006")
@pytest.mark.case_title("Rejeitar VIP20 em carrinho abaixo do mínimo")
def test_vip20_is_rejected_when_cart_is_below_100(driver):
    open_checkout(
        driver,
        [("product_under_minimum_add", '[data-testid="product-under-minimum-add"]')],
    )
    apply_vip20(driver)

    assert visible_text(driver, "coupon_error", '[data-testid="coupon-error"]') == (
        "Este cupom é válido apenas para compras acima de R$ 100,00"
    )
    assert money_value(visible_text(driver, "discount", '[data-testid="discount"]')) == Decimal("0.00")
    assert money_value(visible_text(driver, "total", '[data-testid="total"]')) == Decimal("50.00")


@pytest.mark.parametrize(
    ("product_id", "subtotal", "discount", "total", "accepted"),
    [
        ("product-99-99", Decimal("99.99"), Decimal("0.00"), Decimal("99.99"), False),
        ("product-100-00", Decimal("100.00"), Decimal("0.00"), Decimal("100.00"), False),
        ("product-100-01", Decimal("100.01"), Decimal("20.00"), Decimal("80.01"), True),
    ],
)
@pytest.mark.case_id("CT_CHECKOUT_002")
@pytest.mark.case_title("Validar valores limite do cupom VIP20")
def test_vip20_boundary_values(driver, product_id, subtotal, discount, total, accepted):
    button_name = f"{product_id.replace('-', '_')}_add"
    open_checkout(driver, [(button_name, f'[data-testid="{product_id}-add"]')])
    apply_vip20(driver)

    if accepted:
        assert visible_text(driver, "coupon_success", '[data-testid="coupon-success"]') == (
            "Cupom VIP20 aplicado com sucesso!"
        )
    else:
        assert visible_text(driver, "coupon_error", '[data-testid="coupon-error"]') == (
            "Este cupom é válido apenas para compras acima de R$ 100,00"
        )

    assert money_value(visible_text(driver, "subtotal", '[data-testid="subtotal"]')) == subtotal
    assert money_value(visible_text(driver, "discount", '[data-testid="discount"]')) == discount
    assert money_value(visible_text(driver, "total", '[data-testid="total"]')) == total


@pytest.mark.expired_coupon
@pytest.mark.case_id("CT_CHECKOUT_003")
@pytest.mark.case_title("Rejeitar cupom VIP20 expirado")
def test_vip20_is_rejected_when_expired(driver):
    open_checkout(driver, [("product_expired_coupon_add", '[data-testid="product-expired-coupon-add"]')])
    apply_vip20(driver)

    assert visible_text(driver, "coupon_error", '[data-testid="coupon-error"]')
    assert money_value(visible_text(driver, "discount", '[data-testid="discount"]')) == Decimal("0.00")
    assert money_value(visible_text(driver, "total", '[data-testid="total"]')) == Decimal("150.00")


@pytest.mark.case_id("CT_CHECKOUT_004")
@pytest.mark.case_title("Rejeitar VIP20 para produtos não elegíveis")
def test_vip20_is_rejected_for_non_eligible_products(driver):
    open_checkout(driver, [("product_non_eligible_add", '[data-testid="product-non-eligible-add"]')])
    apply_vip20(driver)

    assert visible_text(driver, "coupon_error", '[data-testid="coupon-error"]')
    assert money_value(visible_text(driver, "subtotal", '[data-testid="subtotal"]')) == Decimal("120.00")
    assert money_value(visible_text(driver, "discount", '[data-testid="discount"]')) == Decimal("0.00")
    assert money_value(visible_text(driver, "total", '[data-testid="total"]')) == Decimal("120.00")


@pytest.mark.case_id("CT_CHECKOUT_005")
@pytest.mark.case_title("Remover desconto ao reduzir carrinho abaixo do mínimo")
def test_removing_item_below_minimum_removes_coupon_discount(driver):
    open_checkout(
        driver,
        [
            ("product_a_add", '[data-testid="product-a-add"]'),
            ("product_b_add", '[data-testid="product-b-add"]'),
        ],
    )
    apply_vip20(driver)
    assert money_value(visible_text(driver, "total", '[data-testid="total"]')) == Decimal("88.00")

    click(driver, "product_b_remove", '[data-testid="product-b-remove"]')

    assert money_value(visible_text(driver, "subtotal", '[data-testid="subtotal"]')) == Decimal("60.00")
    assert money_value(visible_text(driver, "discount", '[data-testid="discount"]')) == Decimal("0.00")
    assert money_value(visible_text(driver, "total", '[data-testid="total"]')) == Decimal("60.00")